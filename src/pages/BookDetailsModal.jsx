import { createPortal } from "react-dom"
import { useEffect } from "react"

function BookDetailsModal({ isOpen, onClose, book, role, onBorrow, onEdit }) {

	useEffect(() => {
		const handleEsc = (e) => {
			if (e.key === "Escape") onClose()
		}
		window.addEventListener("keydown", handleEsc)
		return () => window.removeEventListener("keydown", handleEsc)
	}, [onClose])

	if (!isOpen || !book) return null

	return createPortal(
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal book-modal" onClick={(e) => e.stopPropagation()}>

				<div className="book-modal-content">

					<img src={book.image} alt={book.name} />

					<div className="book-details">
						<h3>{book.name}</h3>
						<p className="author">{book.author}</p>
						<p className="date">{book.date}</p>

						{Array.isArray(book.categories) && book.categories.length ? (
							<div className="book-tags">
								{book.categories.map((c) => (
									<span className="tag" key={c}>
										{c}
									</span>
								))}
							</div>
						) : null}

						<p className="desc">
							This is a sample description of the book.
						</p>

						<div className="modal-actions">

							{role === "admin" && (
								<>
									<button type="button" className="primary" onClick={() => onEdit?.(book)}>
										Edit
									</button>
									<button type="button" className="btn delete">Delete</button>
								</>
							)}

							{role === "user" && onBorrow && (
								<button
									type="button"
									className="primary"
									onClick={() => onBorrow(book)}
								>
									Borrow Book
								</button>
							)}

							<button type="button" className="cancel" onClick={onClose}>
								Close
							</button>

						</div>
					</div>

				</div>

			</div>
		</div>,
		document.body
	)
}

export default BookDetailsModal