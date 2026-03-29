import { useState } from "react"
import BookDetailsModal from "./BookDetailsModal"

function MyBooks() {

	const [selectedBook, setSelectedBook] = useState(null)

	const books = [
		{
			name: "The Last Bookshop in Prague",
			author: "Helen Parusel",
			date: "Due: September 25, 2024",
			image: "https://covers.openlibrary.org/b/id/12883072-L.jpg"
		},
		{
			name: "The Wild Hunt",
			author: "Elizabeth Chadwick",
			date: "Due: September 22, 2024",
			image: "https://covers.openlibrary.org/b/id/12883075-L.jpg"
		}
	]

	return (
		<div className="page">

			{/* HEADER */}
			<div className="page-header">
				<div>
					<h2>My Books</h2>
					<div className="breadcrumb">Dashboard / My Books</div>
				</div>

				<div className="page-actions">
					<input placeholder="Search my books..." />
				</div>
			</div>

			{/* GRID */}
			<div className="books-grid">
				{books.map((book, i) => (
					<div 
						className="book-card" 
						key={i}
						onClick={() => setSelectedBook(book)}
					>
						<img src={book.image} />

						<div className="book-info">
							<h4>{book.name}</h4>
							<p>{book.author}</p>
							<span>{book.date}</span>
						</div>

					</div>
				))}
			</div>

			{/* MODAL */}
			<BookDetailsModal 
				isOpen={!!selectedBook}
				book={selectedBook}
				role="user" // 👈 ADD THIS
				onClose={() => setSelectedBook(null)}
			/>

		</div>
	)
}

export default MyBooks