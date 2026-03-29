import { useState } from "react"
import BookDetailsModal from "./BookDetailsModal"

function Home() {

	const [selectedBook, setSelectedBook] = useState(null)

	// sample data
	const newReleases = [
		{
			name: "The Last Bookshop in Prague",
			author: "Helen Parusel",
			date: "2024",
			image: "https://covers.openlibrary.org/b/id/12883072-L.jpg"
		},
		{
			name: "The Wild Hunt",
			author: "Elizabeth Chadwick",
			date: "2024",
			image: "https://covers.openlibrary.org/b/id/12883075-L.jpg"
		}
	]

	const forYou = [
		{
			name: "Atomic Habits",
			author: "James Clear",
			date: "2018",
			image: "https://covers.openlibrary.org/b/id/10521255-L.jpg"
		},
		{
			name: "Deep Work",
			author: "Cal Newport",
			date: "2016",
			image: "https://covers.openlibrary.org/b/id/8375041-L.jpg"
		}
	]

	const trending = [
		{
			name: "Rich Dad Poor Dad",
			author: "Robert Kiyosaki",
			date: "1997",
			image: "https://covers.openlibrary.org/b/id/8231856-L.jpg"
		},
		{
			name: "The Alchemist",
			author: "Paulo Coelho",
			date: "1988",
			image: "https://covers.openlibrary.org/b/id/10594754-L.jpg"
		}
	]

	const renderRow = (title, books) => (
		<div className="home-section">
			<h3>{title}</h3>

			<div className="home-row">
				{books.map((book, i) => (
					<div 
						className="book-card"
						key={i}
						onClick={() => setSelectedBook(book)}
					>
						<img src={book.image} />

						{/* SAME STRUCTURE SA BOOKS */}
						<div className="book-info">
							<h4>{book.name}</h4>
							<p>{book.author}</p>
							<span>{book.date}</span>
						</div>

					</div>
				))}
			</div>
		</div>
	)

	return (
		<div className="page">

			<h2>Home</h2>

			{renderRow("New Releases", newReleases)}
			{renderRow("For You", forYou)}
			{renderRow("Trending", trending)}

			<BookDetailsModal
				isOpen={!!selectedBook}
				book={selectedBook}
				role="user"
				onClose={() => setSelectedBook(null)}
			/>

		</div>
	)
}

export default Home