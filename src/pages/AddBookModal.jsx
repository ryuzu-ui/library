import { createPortal } from "react-dom"
import { useEffect, useState } from "react"

function AddBookModal({ isOpen, onClose, onAdd, categories = [] }) {
	const noCoverSvg =
		"data:image/svg+xml;charset=UTF-8," +
		encodeURIComponent(
			`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='900' viewBox='0 0 600 900'>
				<defs>
					<linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
						<stop offset='0' stop-color='#f3f5f7'/>
						<stop offset='1' stop-color='#e7eaee'/>
					</linearGradient>
				</defs>
				<rect width='600' height='900' rx='28' fill='url(#g)'/>
				<rect x='55' y='70' width='490' height='760' rx='22' fill='rgba(0,0,0,0.03)' stroke='rgba(0,0,0,0.08)' stroke-width='4'/>
				<path d='M210 390c0-49 40-89 90-89s90 40 90 89-40 89-90 89-90-40-90-89z' fill='rgba(46,125,50,0.12)'/>
				<path d='M245 390c0-30 25-55 55-55s55 25 55 55-25 55-55 55-55-25-55-55z' fill='rgba(46,125,50,0.20)'/>
				<text x='300' y='560' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='28' font-weight='800' fill='rgba(0,0,0,0.60)'>No cover set</text>
				<text x='300' y='606' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='16' font-weight='600' fill='rgba(0,0,0,0.40)'>Upload a cover or paste an image URL</text>
			</svg>`
		)

	const [form, setForm] = useState({
		name: "",
		author: "",
		date: "",
		coverUrl: "",
		imagePreview: "",
		coverFile: null,
		categories: []
	})

	const [localError, setLocalError] = useState("")
	const [submitting, setSubmitting] = useState(false)
	const [newCategory, setNewCategory] = useState("")

	useEffect(() => {
		if (!isOpen) return
		document.body.classList.add("modal-open")
		return () => {
			document.body.classList.remove("modal-open")
		}
	}, [isOpen])

	if (!isOpen) return null

	const handleChange = (e) => {
		const { name, value } = e.target
		setLocalError("")
		setForm(prev => ({
			...prev,
			[name]: value
		}))
	}

	// HANDLE FILE UPLOAD
	const handleImageUpload = (file) => {
		if (!file) return

		const reader = new FileReader()
		reader.onloadend = () => {
			setForm(prev => ({
				...prev,
				imagePreview: reader.result,
				coverFile: file
			}))
		}
		reader.readAsDataURL(file)
	}

	// DRAG DROP
	const handleDrop = (e) => {
		e.preventDefault()
		const file = e.dataTransfer.files[0]
		handleImageUpload(file)
	}

	const clearCover = () => {
		setLocalError("")
		setForm((prev) => ({
			...prev,
			coverUrl: "",
			imagePreview: "",
			coverFile: null,
		}))
	}

	const handleSubmit = async () => {

		const title = (form.name || "").trim()
		const year = (form.date || "").trim()
		if (!title) {
			setLocalError("Book name is required")
			return
		}
		if (!year) {
			setLocalError("Publication year is required")
			return
		}
		if (!onAdd) {
			onClose()
			return
		}

		setSubmitting(true)
		try {
			const payload = {
				name: form.name,
				author: form.author,
				date: form.date,
				image: form.coverUrl || form.imagePreview,
				coverFile: form.coverFile,
				categories: form.categories,
			}

			const result = await onAdd(payload)
			if (result?.success === false) {
				setLocalError(result?.message || "Unable to add book")
				return
			}
			onClose()

			setForm({
				name: "",
				author: "",
				date: "",
				coverUrl: "",
				imagePreview: "",
				coverFile: null,
				categories: []
			})
		} catch (e) {
			setLocalError(e?.message || "Unable to add book")
		} finally {
			setSubmitting(false)
		}
	}

	const categoryOptions = (categories || []).filter(Boolean)

	const toggleCategory = (cat) => {
		setLocalError("")
		setForm((prev) => {
			const next = new Set(prev.categories || [])
			if (next.has(cat)) next.delete(cat)
			else next.add(cat)
			return { ...prev, categories: Array.from(next) }
		})
	}

	const addCategoriesFromInput = () => {
		const raw = (newCategory || "").trim()
		if (!raw) return
		const parts = raw
			.split(",")
			.map((p) => p.trim())
			.filter(Boolean)
		if (!parts.length) return
		setLocalError("")
		setForm((prev) => {
			const next = new Set(prev.categories || [])
			for (const p of parts) next.add(p)
			return { ...prev, categories: Array.from(next) }
		})
		setNewCategory("")
	}

	return createPortal(
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal book-modal" onClick={(e) => e.stopPropagation()}>

				<div className="book-modal-content">

					{/* LEFT SIDE IMAGE */}
					<div
						className={`book-image-preview upload-box ${(form.imagePreview || form.coverUrl) ? "has-cover" : ""}`}
						onDragOver={(e) => e.preventDefault()}
						onDrop={handleDrop}
					>
						<img
							src={form.imagePreview || form.coverUrl || noCoverSvg}
							alt="preview"
							onError={(e) => {
								if (e.currentTarget.src !== noCoverSvg) e.currentTarget.src = noCoverSvg
							}}
						/>

						<label className="upload-label">
							<input
								type="file"
								accept="image/*"
								onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
								hidden
							/>
							<span>Click or Drop Image</span>
						</label>

						{(form.imagePreview || form.coverUrl) ? (
							<button type="button" className="btn upload-clear" onClick={clearCover} disabled={submitting}>
								Remove cover
							</button>
						) : null}
					</div>

					<div className="book-details">
						<div className="modal-header">
							<div>
								<h3 className="modal-title">Add Book</h3>
								<div className="modal-subtitle">Add a new title to your library</div>
							</div>
							<button type="button" className="modal-close" onClick={onClose} aria-label="Close">
								×
							</button>
						</div>

						{localError ? <div className="form-error">{localError}</div> : null}

						<div className="form-grid">

							<div className="form-field">
								<label>Book name</label>
								<input
									name="name"
									value={form.name}
									onChange={handleChange}
									placeholder="e.g., Clean Code"
									autoFocus
								/>
							</div>

							<div className="form-field">
								<label>Author</label>
								<input
									name="author"
									value={form.author}
									onChange={handleChange}
									placeholder="e.g., Robert C. Martin"
								/>
							</div>

							<div className="form-field">
								<label>Publication year</label>
								<input
									name="date"
									type="number"
									inputMode="numeric"
									value={form.date}
									onChange={handleChange}
									placeholder="e.g., 2008"
									min="0"
								/>
							</div>

							<div className="form-field">
								<label>Cover image (URL or upload)</label>
								<input
									name="coverUrl"
									value={form.coverUrl}
									onChange={handleChange}
									placeholder="https://..."
								/>
							</div>

							<div className="form-field form-field-full">
								<label>Categories</label>
								<div className="category-pills">
									{categoryOptions.length ? (
										categoryOptions.map((c) => (
											<button
												type="button"
												key={c}
												className={
													form.categories?.includes(c)
														? "pill pill-active"
														: "pill"
												}
												onClick={() => toggleCategory(c)}
												disabled={submitting}
											>
												{c}
											</button>
										))
									) : (
										<div className="muted">No categories yet</div>
									)}
								</div>
								<div style={{ display: "flex", gap: 8, marginTop: 10 }}>
									<input
										type="text"
										value={newCategory}
										onChange={(e) => setNewCategory(e.target.value)}
										placeholder="Add category (comma-separated)"
										disabled={submitting}
									/>
									<button
										type="button"
										className="btn"
										onClick={addCategoriesFromInput}
										disabled={submitting}
									>
										Add
									</button>
								</div>
							</div>
						</div>

						<div className="modal-actions modal-actions-row">
							<button type="button" className="cancel" onClick={onClose} disabled={submitting}>
								Cancel
							</button>
							<button type="button" className="primary" onClick={handleSubmit} disabled={submitting}>
								{submitting ? "Adding..." : "Add Book"}
							</button>
						</div>
					</div>

				</div>

			</div>
		</div>,
		document.body
	)
}

export default AddBookModal