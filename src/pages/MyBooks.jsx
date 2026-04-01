import { useEffect, useMemo, useState } from "react"
import BookDetailsModal from "./BookDetailsModal"
import { supabase } from "../lib/supabaseClient"

function MyBooks() {

	const [selectedBook, setSelectedBook] = useState(null)
	const [search, setSearch] = useState("")
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [authorFilter, setAuthorFilter] = useState("")
	const [categoryFilter, setCategoryFilter] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [books, setBooks] = useState([])

	const placeholderCover =
		"https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=60"

	const formatDue = (dueAt) => {
		if (!dueAt) return ""
		try {
			const d = new Date(dueAt)
			const pretty = d.toLocaleDateString(undefined, {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
			return `Due: ${pretty}`
		} catch {
			return ""
		}
	}

	const loadMyLoans = async () => {
		setError("")
		setLoading(true)
		try {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser()
			if (userError) throw new Error(userError.message)
			if (!user) throw new Error("You must be logged in")

			const { data, error: loansError } = await supabase
				.from("loans")
				.select(
					"id, due_at, checked_out_at, copy_id, copies:copy_id(id, book_id, books(id, title, publication_year, cover_url, book_authors(authors(name)), book_categories(categories(name))))"
				)
				.eq("user_id", user.id)
				.order("checked_out_at", { ascending: false })

			if (loansError) throw new Error(loansError.message)

			const mapped = (data || [])
				.map((loan) => {
					const book = loan?.copies?.books
					if (!book) return null

					const authorNames = (book.book_authors || [])
						.map((ba) => ba?.authors?.name)
						.filter(Boolean)
					const author = authorNames.length ? authorNames.join(", ") : "Unknown"
					const categoryNames = (book.book_categories || [])
						.map((bc) => bc?.categories?.name)
						.filter(Boolean)

					return {
						id: book.id,
						loanId: loan.id,
						copyId: loan.copy_id,
						name: book.title,
						author,
						date: formatDue(loan.due_at),
						image: book.cover_url || placeholderCover,
						publicationYear: book.publication_year ?? null,
						coverUrl: book.cover_url ?? "",
						categories: categoryNames,
						dueAt: loan.due_at || null,
					}
				})
				.filter(Boolean)

			setBooks(mapped)
		} catch (e) {
			setError(e?.message || "Unable to load your books")
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		void loadMyLoans()
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

			{/* HEADER */}
			<div className="page-header">
				<div>
					<h2>My Books</h2>
					<div className="breadcrumb">Dashboard / My Books</div>
				</div>

				<div className="page-actions">
					<input
						placeholder="Search my books..."
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

			{/* GRID */}
			<div className="books-grid">
				{loading ? (
					<div style={{ padding: 10, color: "#666" }}>Loading your books...</div>
				) : null}
				{!loading && !filteredBooks.length ? (
					<div className="books-empty">No borrowed books found.</div>
				) : null}
				{filteredBooks.map((book, i) => (
					<div 
						className="book-card" 
						key={book.loanId ?? book.id ?? i}
						onClick={() => setSelectedBook(book)}
					>
						<img src={book.image} />

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