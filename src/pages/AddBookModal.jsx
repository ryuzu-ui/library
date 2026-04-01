import { useMemo, useState } from "react"

function AddBookModal({ isOpen, onClose, onAdd, categories = [] }) {

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

	const categoryOptions = useMemo(() => {
		return (categories || []).filter(Boolean)
	}, [categories])

	const toggleCategory = (cat) => {
		setLocalError("")
		setForm((prev) => {
			const next = new Set(prev.categories || [])
			if (next.has(cat)) next.delete(cat)
			else next.add(cat)
			return { ...prev, categories: Array.from(next) }
		})
	}

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal book-modal" onClick={(e) => e.stopPropagation()}>

				<div className="book-modal-content">

					{/* LEFT SIDE IMAGE */}
					<div
						className="book-image-preview upload-box"
						onDragOver={(e) => e.preventDefault()}
						onDrop={handleDrop}
					>
						<img
							src={form.imagePreview || form.coverUrl || "https://via.placeholder.com/150"}
							alt="preview"
						/>

						<label className="upload-label">
							<input
								type="file"
								accept="image/*"
								onChange={(e) => handleImageUpload(e.target.files[0])}
								hidden
							/>
							<span>Click or Drop Image</span>
						</label>
					</div>

					<div className="book-details">
						<div className="modal-header">
							<div>
								<h3 className="modal-title">Add Book</h3>
								<div className="modal-subtitle">Add a new title to your library</div>
							</div>
							<button className="modal-close" onClick={onClose} aria-label="Close">
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
							</div>
						</div>

						<div className="modal-actions modal-actions-row">
							<button className="cancel" onClick={onClose} disabled={submitting}>
								Cancel
							</button>
							<button className="primary" onClick={handleSubmit} disabled={submitting}>
								{submitting ? "Adding..." : "Add Book"}
							</button>
						</div>
					</div>

				</div>

			</div>
		</div>
	)
}

export default AddBookModal