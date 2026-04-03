import { createPortal } from "react-dom"
import { useEffect } from "react"

function BookDetailsModal({ isOpen, onClose, book, role, onBorrow, onReturn, onEdit, onDelete }) {
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

					<img
						src={book.image || noCoverSvg}
						alt={book.name}
						onError={(e) => {
							if (e.currentTarget.src !== noCoverSvg) e.currentTarget.src = noCoverSvg
						}}
					/>

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
									<button type="button" className="btn delete" onClick={() => onDelete?.(book)}>
										Delete
									</button>
								</>
							)}

							{role === "user" && onBorrow && !book?.loanId && (
								<button
									type="button"
									className="primary"
									onClick={() => onBorrow(book)}
								>
									Borrow Book
								</button>
							)}

							{role === "user" && book?.loanId && onReturn && (
								<button
									type="button"
									className="primary"
									onClick={() => onReturn(book)}
								>
									Return Book
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