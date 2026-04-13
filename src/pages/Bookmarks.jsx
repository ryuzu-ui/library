import { useEffect, useState } from "react"

function Bookmarks() {
	const [bookmarks, setBookmarks] = useState([])

	useEffect(() => {
		const saved = JSON.parse(localStorage.getItem("bookmarks") || "[]")
		setBookmarks(saved)
	}, [])

	return (
		<div className="page">
			<h2>Bookmarked Books</h2>

			<div className="books-grid">
				{bookmarks.length === 0 ? (
					<p>No bookmarks yet.</p>
				) : (
					bookmarks.map((book) => (
						<div className="book-card" key={book.id}>
							<img src={book.image} alt={book.name} />
							<div className="book-info">
								<h4>{book.name}</h4>
								<p>{book.author}</p>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}

export default Bookmarks