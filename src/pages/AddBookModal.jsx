import { useState } from "react"

function AddBookModal({ isOpen, onClose, onAdd }) {

	const [form, setForm] = useState({
		name: "",
		author: "",
		date: "",
		image: ""
	})

	if (!isOpen) return null

	const handleChange = (e) => {
		const { name, value } = e.target
		setForm(prev => ({
			...prev,
			[name]: value
		}))
	}

	// 📸 HANDLE FILE UPLOAD
	const handleImageUpload = (file) => {
		if (!file) return

		const reader = new FileReader()
		reader.onloadend = () => {
			setForm(prev => ({
				...prev,
				image: reader.result // base64 preview
			}))
		}
		reader.readAsDataURL(file)
	}

	// 📦 DRAG DROP
	const handleDrop = (e) => {
		e.preventDefault()
		const file = e.dataTransfer.files[0]
		handleImageUpload(file)
	}

	const handleSubmit = () => {
		if (onAdd) onAdd(form)
		onClose()

		setForm({
			name: "",
			author: "",
			date: "",
			image: ""
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
							src={form.image || "https://via.placeholder.com/150"} 
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

					{/* RIGHT SIDE FORM */}
					<div className="book-details">

						<h3>Add Book</h3>

						<input
							name="name"
							value={form.name}
							onChange={handleChange}
							placeholder="Book Name"
						/>

						<input
							name="author"
							value={form.author}
							onChange={handleChange}
							placeholder="Author"
						/>

						<input
							name="date"
							value={form.date}
							onChange={handleChange}
							placeholder="Publish Date"
						/>

						<div className="modal-actions">
							<button className="primary" onClick={handleSubmit}>
								Add Book
							</button>
							<button className="cancel" onClick={onClose}>
								Cancel
							</button>
						</div>

					</div>

				</div>

			</div>
		</div>
	)
}

export default AddBookModal