import { useEffect, useMemo, useState } from "react"
import BookDetailsModal from "./BookDetailsModal"
import { supabase } from "../lib/supabaseClient"

function Home() {

	const [selectedBook, setSelectedBook] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [books, setBooks] = useState([])

	const placeholderCover =
		"https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=60"

	const loadBooks = async () => {
		setError("")
		setLoading(true)
		try {
			const { data, error: booksError } = await supabase
				.from("books")
				.select(
					"id, title, publication_year, cover_url, created_at, book_authors(authors(name)), book_categories(categories(name))"
				)
				.order("created_at", { ascending: false })

			if (booksError) throw new Error(booksError.message)

			const mapped = (data || []).map((b) => {
				const authorNames = (b.book_authors || [])
					.map((ba) => ba?.authors?.name)
					.filter(Boolean)
				const author = authorNames.length ? authorNames.join(", ") : "Unknown"
				const date = b.publication_year ? String(b.publication_year) : ""
				const categoryNames = (b.book_categories || [])
					.map((bc) => bc?.categories?.name)
					.filter(Boolean)

				return {
					id: b.id,
					name: b.title,
					author,
					date,
					image: b.cover_url || placeholderCover,
					categories: categoryNames,
				}
			})

			setBooks(mapped)
		} catch (e) {
			setError(e?.message || "Unable to load books")
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		void loadBooks()
	}, [])

	const newReleases = useMemo(() => books.slice(0, 8), [books])
	const forYou = useMemo(() => books.slice(8, 16), [books])
	const trending = useMemo(() => books.slice(16, 24), [books])

	const renderRow = (title, books) => (
		<div className="home-section">
			<h3 style={{ color: "var(--text-primary)" }}>{title}</h3>

			<div className="home-row">
				{!books.length ? (
					<div className="books-empty">No books found.</div>
				) : null}
				{books.map((book, i) => (
					<div
						className="book-card"
						key={i}
						onClick={() => setSelectedBook(book)}
					>
						<img src={book.image} alt={book.name} />

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

			<h2 style={{ color: "var(--text-primary)" }}>Home</h2>
			{error ? <p className="login-error">{error}</p> : null}
			{loading ? (
				<div style={{ padding: 10, color: "var(--text-muted)" }}>Loading books...</div>
			) : null}

			{renderRow("New Releases", newReleases)}
			{renderRow("For You", forYou)}
			{renderRow("Trending", trending)}

			<BookDetailsModal
				isOpen={!!selectedBook}
				book={selectedBook}
				role="user"
				onClose={() => setSelectedBook(null)}
				onBorrow={(book) => {
					console.log("Borrowed:", book)
					setSelectedBook(null)
				}}
			/>

		</div>
	)
}

export default Home