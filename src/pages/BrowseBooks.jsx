import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import BookDetailsModal from "./BookDetailsModal"
import { supabase } from "../lib/supabaseClient"

function BrowseBooks() {
	const [searchParams] = useSearchParams()
	const [selectedBook, setSelectedBook] = useState(null)
	const [searchTerm, setSearchTerm] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")

	useEffect(() => {
		const q = searchParams.get("q") || ""
		setSearchTerm(q)
	}, [searchParams])

	const [books, setBooks] = useState([])
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [authorFilter, setAuthorFilter] = useState("")
	const [categoryFilter, setCategoryFilter] = useState("")

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
					image: b.cover_url || "",
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

	const borrowBook = async (book) => {
		if (!book?.id) return
		const bookId = Number(book.id)
		if (!Number.isFinite(bookId)) {
			setError("Invalid book id")
			return
		}
		setError("")
		setLoading(true)
		try {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser()
			if (userError) throw new Error(userError.message)
			if (!user) throw new Error("You must be logged in")

			const { data, error: borrowError } = await supabase.rpc("borrow_book", {
				p_book_id: bookId,
				p_days: 14,
			})
			if (borrowError) throw new Error(borrowError.message)
			if (!data || !data.length) throw new Error("No copies available")

			setSelectedBook(null)
		} catch (e) {
			setError(e?.message || "Unable to borrow book")
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
		const q = searchTerm.trim().toLowerCase()
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
	}, [books, searchTerm, authorFilter, categoryFilter])

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
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
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
						<img
						src={book.image || noCoverSvg}
						alt={book.name}
						onError={(e) => {
							if (e.currentTarget.src !== noCoverSvg) e.currentTarget.src = noCoverSvg
						}}
					/>
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
				onBorrow={borrowBook}
			/>
		</div>
	)
}

export default BrowseBooks
