import { useState } from "react"
import BookDetailsModal from "./BookDetailsModal"
import AddBookModal from "./AddBookModal"


function Books() {

	const [selectedBook, setSelectedBook] = useState(null)
	const [addOpen, setAddOpen] = useState(false)

	const [books, setBooks] = useState([
		{
			name: "The Last Bookshop in Prague",
			author: "Helen Parusel",
			date: "September 25, 2024",
			image: "https://covers.openlibrary.org/b/id/12883072-L.jpg"
		},
		{
			name: "The Wild Hunt",
			author: "Elizabeth Chadwick",
			date: "September 22, 2024",
			image: "https://covers.openlibrary.org/b/id/12883075-L.jpg"
		}
	])

	return (
		<div className="page">

			<div className="page-header">
				<div>
					<h2>Books</h2>
					<div className="breadcrumb">Dashboard / Books</div>
				</div>

				<div className="page-actions">
					<input placeholder="Search books..." />
					<button 
						className="primary"
						onClick={() => setAddOpen(true)}
					>
						Add Book
					</button>
				</div>
			</div>

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
			<BookDetailsModal 
				isOpen={!!selectedBook}
				book={selectedBook}
				role="admin" // 👈 ADD THIS
				onClose={() => setSelectedBook(null)}
			/>

			<AddBookModal
				isOpen={addOpen}
				onClose={() => setAddOpen(false)}
				onAdd={(newBook) => {
					setBooks(prev => [...prev, newBook])
				}}
			/>

		</div>
	)
}

export default Books