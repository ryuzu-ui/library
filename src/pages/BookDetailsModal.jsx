function BookDetailsModal({ isOpen, onClose, book, role }) {

	if (!isOpen || !book) return null

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal book-modal" onClick={(e) => e.stopPropagation()}>

				<div className="book-modal-content">

					<img src={book.image} alt={book.name} />

					<div className="book-details">
						<h3>{book.name}</h3>
						<p className="author">{book.author}</p>
						<p className="date">{book.date}</p>

						<p className="desc">
							This is a sample description of the book. You can replace this with real data.
						</p>

						<div className="modal-actions">

							{/* ADMIN ONLY */}
							{role === "admin" && (
								<>
									<button className="primary">Edit</button>
									<button className="btn delete">Delete</button>
								</>
							)}

							{/* USER ONLY */}
							{role === "user" && (
								<button className="primary">Return Book</button>
							)}

							<button className="cancel" onClick={onClose}>Close</button>
						</div>
					</div>

				</div>

			</div>
		</div>
	)
}

export default BookDetailsModal