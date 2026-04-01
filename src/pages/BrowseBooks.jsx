import { useEffect, useMemo, useState } from "react"
import BookDetailsModal from "./BookDetailsModal"
import { supabase } from "../lib/supabaseClient"

function BrowseBooks() {
	const [selectedBook, setSelectedBook] = useState(null)
	const [search, setSearch] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")

	const [books, setBooks] = useState([])
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [authorFilter, setAuthorFilter] = useState("")
	const [categoryFilter, setCategoryFilter] = useState("")

	const placeholderCover =
		"https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=60"

	const loadBooks = async () => {
		setError("")
		setLoading(true)
		try {
			const { data, error: booksError } = await supabase
				.from("books")
				.select(
					"id, title, publication_year, cover_url, book_authors(authors(name)), book_categories(categories(name))"
				)
				.order("created_at", { ascending: false })

			if (booksError) throw new Error(booksError.message)

			const mapped = (data || []).map((b) => {
				const authorNames = (b.book_authors || [])
					.map((ba) => ba?.authors?.name)
					.filter(Boolean)
				const author = authorNames.length ? authorNames.join(", ") : "Unknown"
				const date = b.publication_year ? `Published: ${b.publication_year}` : ""

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

	const authors = useMemo(() => {
		const set = new Set()
		for (const b of books) {
			if (b.author && b.author !== "Unknown") set.add(b.author)
		}
		return Array.from(set).sort((a, b) => a.localeCompare(b))
	}, [books])

	const categories = useMemo(() => {
		const set = new Set()
		for (const b of books) {
			for (const c of b.categories || []) set.add(c)
		}
		return Array.from(set).sort((a, b) => a.localeCompare(b))
	}, [books])

	const filteredBooks = useMemo(() => {
		const q = search.trim().toLowerCase()
		return books.filter((b) => {
			const hay = `${b.name} ${b.author}`.toLowerCase()
			if (q && !hay.includes(q)) return false
			if (authorFilter && b.author !== authorFilter) return false
			if (categoryFilter) {
				const bookCats = b.categories || []
				if (!bookCats.includes(categoryFilter)) return false
			}
			return true
		})
	}, [books, search, authorFilter, categoryFilter])

	return (
		<div className="page">
			<div className="page-header">
				<div>
					<h2>Browse Books</h2>
					<div className="breadcrumb">Dashboard / Browse</div>
				</div>

				<div className="page-actions">
					<input
						placeholder="Search books..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<button
						className="btn filter-btn"
						onClick={() => setFiltersOpen((v) => !v)}
					>
						Filter
					</button>
				</div>
			</div>

			{filtersOpen ? (
				<div className="filters-panel">
					<div className="filters-row">
						<div className="filter-field">
							<label>Author</label>
							<select
								value={authorFilter}
								onChange={(e) => setAuthorFilter(e.target.value)}
							>
								<option value="">All</option>
								{authors.map((a) => (
									<option key={a} value={a}>
										{a}
									</option>
								))}
							</select>
						</div>

						<div className="filter-field">
							<label>Category</label>
							<select
								value={categoryFilter}
								onChange={(e) => setCategoryFilter(e.target.value)}
							>
								<option value="">All</option>
								{categories.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</select>
						</div>

						<button
							className="btn"
							onClick={() => {
								setAuthorFilter("")
								setCategoryFilter("")
							}}
						>
							Clear
						</button>
					</div>
				</div>
			) : null}

			{error ? <p className="login-error">{error}</p> : null}

			<div className="books-grid">
				{loading ? (
					<div style={{ padding: 10, color: "#666" }}>Loading books...</div>
				) : null}
				{!loading && !filteredBooks.length ? (
					<div className="books-empty">No books found.</div>
				) : null}
				{filteredBooks.map((book, i) => (
					<div
						className="book-card"
						key={book.id ?? i}
						onClick={() => setSelectedBook(book)}
					>
						<img src={book.image} alt={book.name} />
						<div className="book-info">
							<h4>{book.name}</h4>
							<p>{book.author}</p>
							{book.categories?.length ? (
								<div className="book-tags">
									{book.categories.slice(0, 2).map((c) => (
										<span className="tag" key={c}>
											{c}
										</span>
									))}
								</div>
							) : null}
							<span>{book.date}</span>
						</div>
					</div>
				))}
			</div>

			<BookDetailsModal
				isOpen={!!selectedBook}
				book={selectedBook}
				role="user"
				onClose={() => setSelectedBook(null)}
			/>
		</div>
	)
}

export default BrowseBooks
