import { useState, useEffect } from "react"

function EditBookModal({ isOpen, onClose, book, onSave }) {

	const [form, setForm] = useState({
		name: "",
		author: "",
		date: "",
		image: ""
	})

	// auto-fill kapag may book
	useEffect(() => {
		if (book) {
			setForm(book)
		}
	}, [book])

	if (!isOpen || !book) return null

	const handleChange = (e) => {
		const { name, value } = e.target
		setForm(prev => ({
			...prev,
			[name]: value
		}))
	}

	const handleSubmit = () => {
		if (onSave) onSave(form)
		onClose()
	}

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal book-modal" onClick={(e) => e.stopPropagation()}>

				<h3>Edit Book</h3>

				<div className="edit-form">

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

					<input
						name="image"
						value={form.image}
						onChange={handleChange}
						placeholder="Image URL"
					/>

				</div>

				<div className="modal-actions">
					<button className="primary" onClick={handleSubmit}>
						Save Changes
					</button>
					<button className="cancel" onClick={onClose}>
						Cancel
					</button>
				</div>

			</div>
		</div>
	)
}

export default EditBookModal