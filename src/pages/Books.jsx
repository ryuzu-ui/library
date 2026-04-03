	import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import BookDetailsModal from "./BookDetailsModal"
import AddBookModal from "./AddBookModal"
import EditBookModal from "./EditBookModal"
import { supabase } from "../lib/supabaseClient"
import toast from "react-hot-toast"

function Books() {
	const [searchParams] = useSearchParams()

	const [selectedBook, setSelectedBook] = useState(null)
	const [addOpen, setAddOpen] = useState(false)
	const [editOpen, setEditOpen] = useState(false)
	const [editBook, setEditBook] = useState(null)
	const [search, setSearch] = useState("")
	const [filtersOpen, setFiltersOpen] = useState(false)

	const [authorFilter, setAuthorFilter] = useState("")
	const [categoryFilter, setCategoryFilter] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")


	const [books, setBooks] = useState([])
	const [categories, setCategories] = useState([])


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

	const withCacheBuster = (url) => {
		const raw = String(url || "").trim()
		if (!raw) return ""
		const sep = raw.includes("?") ? "&" : "?"
		return `${raw}${sep}t=${Date.now()}`
	}

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
					publicationYear: b.publication_year ?? null,
					coverUrl: b.cover_url ?? "",
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

	const loadCategories = async () => {
		try {
			const { data, error } = await supabase
				.from("categories")
				.select("id, name")
			if (error) throw new Error(error.message)
			setCategories(data || [])
		} catch (e) {
			setError(e?.message || "Unable to load categories")
		}
	}

	useEffect(() => {
		void loadBooks()
		void loadCategories()
	}, [])

	useEffect(() => {
		const q = searchParams.get("q") || ""
		setSearch(q)
	}, [searchParams])

	const authorOptions = useMemo(() => {
		const set = new Set()
		for (const b of books) {
			if (b.author && b.author !== "Unknown") set.add(b.author)
		}
		return Array.from(set).sort((a, b) => a.localeCompare(b))
	}, [books])

	const categoryOptions = useMemo(() => {
		if (categories.length) return categories.map((c) => c.name)
		const set = new Set()
		for (const b of books) {
			for (const c of b.categories || []) set.add(c)
		}
		return Array.from(set).sort((a, b) => a.localeCompare(b))
	}, [books, categories])

	const filteredBooks = useMemo(() => {
		const q = search.trim().toLowerCase()
		if (!q) return books
		return books
			.filter((b) => {
				const hay = `${b.name} ${b.author}`.toLowerCase()
				return hay.includes(q)
			})
			.filter((b) => {
				if (authorFilter && b.author !== authorFilter) return false
				if (categoryFilter) {
					const bookCats = b.categories || []
					if (!bookCats.includes(categoryFilter)) return false
				}
				return true
			})
	}, [books, search])

	const filteredBooksWithFilters = useMemo(() => {
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

	const handleAddBook = async (newBook) => {

		setError("")
		setLoading(true)
		try {
			const title = (newBook?.name || "").trim()
			const authorName = (newBook?.author || "").trim()
			const coverUrl = (newBook?.image || "").trim()
			const coverFile = newBook?.coverFile ?? null
			const nextCategories = Array.isArray(newBook?.categories)
				? newBook.categories
				: []

			const rawYear = (newBook?.date || "").trim()
			const publicationYear = rawYear ? Number.parseInt(rawYear, 10) : null

			if (!title) {
				throw new Error("Book name is required")
			}

			if (!Number.isFinite(publicationYear)) {
				throw new Error("Publication year is required")
			}

			const coverUrlForDb = coverUrl.startsWith("data:") ? "" : coverUrl

			const { data: upsertedBook, error: upsertBookError } = await supabase
				.from("books")
				.upsert(
					{
						title,
						publication_year: publicationYear,
						cover_url: coverUrlForDb || null,
					},
					{ onConflict: "title,publication_year" }
				)
				.select("id")
				.single()

			if (upsertBookError) throw new Error(upsertBookError.message)

			const { data: existingCopy, error: existingCopyError } = await supabase
				.from("book_copies")
				.select("id")
				.eq("book_id", upsertedBook.id)
				.limit(1)
				.maybeSingle()
			if (existingCopyError) throw new Error(existingCopyError.message)
			if (!existingCopy) {
				const barcodeBase =
					typeof crypto !== "undefined" && crypto.randomUUID
						? crypto.randomUUID()
						: `${Date.now()}-${Math.random().toString(16).slice(2)}`
				const barcode = `BC-${upsertedBook.id}-${barcodeBase}`
				const { error: createCopyError } = await supabase
					.from("book_copies")
					.insert({ book_id: upsertedBook.id, barcode })
				if (createCopyError) throw new Error(createCopyError.message)
			}

			if (authorName) {
				const { data: authorRow, error: authorError } = await supabase
					.from("authors")
					.upsert({ name: authorName }, { onConflict: "name" })
					.select("id")
					.single()

				if (authorError) throw new Error(authorError.message)

				const { error: linkError } = await supabase
					.from("book_authors")
					.upsert(
						{
							book_id: upsertedBook.id,
							author_id: authorRow.id,
						},
						{ onConflict: "book_id,author_id" }
					)

				if (linkError) throw new Error(linkError.message)
			}

			let finalCoverUrl = coverUrlForDb || ""
			if (!coverUrlForDb && coverFile) {

				const fileExt = (coverFile.name || "").split(".").pop() || "png"
				const fileId =
					typeof crypto !== "undefined" && crypto.randomUUID
						? crypto.randomUUID()
						: `${Date.now()}`
				const filePath = `${upsertedBook.id}/${fileId}.${fileExt}`

				const { error: uploadError } = await supabase.storage
					.from("book-covers")
					.upload(filePath, coverFile, {
						upsert: true,
						contentType: coverFile.type || undefined,
					})

				if (uploadError) {
					throw new Error(
						uploadError.message || "Cover upload failed. Please try again."
					)
				}

				const { data: publicData } = supabase.storage
					.from("book-covers")
					.getPublicUrl(filePath)

				const publicUrl = publicData?.publicUrl || ""
				if (!publicUrl) {
					throw new Error("Cover upload succeeded, but URL generation failed")
				}

				const bustedUrl = withCacheBuster(publicUrl)
				const { error: updateCoverError } = await supabase
					.from("books")
					.update({ cover_url: bustedUrl })
					.eq("id", upsertedBook.id)

				if (updateCoverError) throw new Error(updateCoverError.message)
				finalCoverUrl = bustedUrl
			} else {
				finalCoverUrl = coverUrlForDb
			}

			const categoryNames = Array.from(
				new Set(
					nextCategories
						.map((c) => String(c || "").trim())
						.filter(Boolean)
				)
			)
			if (categoryNames.length) {
				const { data: upsertedCats, error: catError } = await supabase
					.from("categories")
					.upsert(categoryNames.map((name) => ({ name })), { onConflict: "name" })
					.select("id")
				if (catError) throw new Error(catError.message)

				await supabase.from("book_categories").delete().eq("book_id", upsertedBook.id)
				const links = (upsertedCats || []).map((c) => ({
					book_id: upsertedBook.id,
					category_id: c.id,
				}))
				if (links.length) {
					const { error: linkErr } = await supabase
						.from("book_categories")
						.upsert(links, { onConflict: "book_id,category_id" })
					if (linkErr) throw new Error(linkErr.message)
				}
			}

			if (finalCoverUrl) {
				setBooks((prev) =>
					prev.map((b) =>
						b.id === upsertedBook.id
							? {
								...b,
								image: finalCoverUrl,
								coverUrl: finalCoverUrl,
							}
							: b
					)
				)
			}
			await loadBooks()
			return { success: true }
		} catch (e) {
			setError(e?.message || "Unable to add book")
			return { success: false, message: e?.message || "Unable to add book" }
		} finally {
			setLoading(false)
		}
	}

	const handleEditOpen = (book) => {
		if (!book) return
		setSelectedBook(null)
		setEditBook({
			...book,
			date: book.publicationYear != null ? String(book.publicationYear) : "",
			image: book.coverUrl || "",
		})
		setEditOpen(true)
	}

	const handleSaveBook = async (updatedBook) => {

		setError("")
		setLoading(true)
		try {
			const title = (updatedBook?.name || "").trim()
			const authorName = (updatedBook?.author || "").trim()
			const coverUrl = (updatedBook?.image || "").trim()
			const coverFile = updatedBook?.coverFile ?? null
			const rawYear = (updatedBook?.date || "").trim()
			const publicationYear = rawYear ? Number.parseInt(rawYear, 10) : null
			const nextCategories = Array.isArray(updatedBook?.categories)
				? updatedBook.categories
				: []

			if (!title) {
				throw new Error("Book name is required")
			}

			if (!Number.isFinite(publicationYear)) {
				throw new Error("Publication year is required")
			}

			const coverUrlForDb = coverUrl.startsWith("data:") ? "" : coverUrl

			const { error: updateBookError } = await supabase
				.from("books")
				.update({
					title,
					publication_year: publicationYear,
					cover_url: coverUrlForDb || null,
				})
				.eq("id", updatedBook.id)

			if (updateBookError) throw new Error(updateBookError.message)

			if (authorName) {
				const { data: authorRow, error: authorError } = await supabase
					.from("authors")
					.upsert({ name: authorName }, { onConflict: "name" })
					.select("id")
					.single()

				if (authorError) throw new Error(authorError.message)

				const { error: linkError } = await supabase
					.from("book_authors")
					.upsert(
						{
							book_id: updatedBook.id,
							author_id: authorRow.id,
						},
						{ onConflict: "book_id,author_id" }
					)

				if (linkError) throw new Error(linkError.message)
			}

			let finalCoverUrl = coverUrlForDb
			if (coverFile) {

				const fileExtFromName = (coverFile.name || "").split(".").pop() || ""
				const fileExtFromType = (coverFile.type || "").split("/").pop() || ""
				const fileExt = (fileExtFromName || fileExtFromType || "png").toLowerCase()
				const fileId =
					typeof crypto !== "undefined" && crypto.randomUUID
						? crypto.randomUUID()
						: `${Date.now()}`
				const filePath = `${updatedBook.id}/${fileId}.${fileExt}`

				const { error: uploadError } = await supabase.storage
					.from("book-covers")
					.upload(filePath, coverFile, {
						upsert: true,
						contentType: coverFile.type || undefined,
					})

				if (uploadError) {
					throw new Error(
						uploadError.message || "Cover upload failed. Please try again."
					)
				}

				const { data: publicData } = supabase.storage
					.from("book-covers")
					.getPublicUrl(filePath)

				const publicUrl = publicData?.publicUrl || ""
				if (!publicUrl) {
					throw new Error("Cover upload succeeded, but URL generation failed")
				}

				const bustedUrl = withCacheBuster(publicUrl)
				const { error: updateCoverError } = await supabase
					.from("books")
					.update({ cover_url: bustedUrl })
					.eq("id", updatedBook.id)

				if (updateCoverError) throw new Error(updateCoverError.message)
				finalCoverUrl = bustedUrl
			} else {
				finalCoverUrl = coverUrlForDb
			}

			const categoryNames = Array.from(
				new Set(
					nextCategories
						.map((c) => String(c || "").trim())
						.filter(Boolean)
				)
			)
			if (categoryNames.length) {
				const { data: upsertedCats, error: catError } = await supabase
					.from("categories")
					.upsert(categoryNames.map((name) => ({ name })), { onConflict: "name" })
					.select("id")
				if (catError) throw new Error(catError.message)

				await supabase.from("book_categories").delete().eq("book_id", updatedBook.id)
				const links = (upsertedCats || []).map((c) => ({
					book_id: updatedBook.id,
					category_id: c.id,
				}))
				if (links.length) {
					const { error: linkErr } = await supabase
						.from("book_categories")
						.upsert(links, { onConflict: "book_id,category_id" })
					if (linkErr) throw new Error(linkErr.message)
				}
			}

			if (finalCoverUrl) {
				setBooks((prev) =>
					prev.map((b) =>
						b.id === updatedBook.id
							? {
								...b,
								image: finalCoverUrl,
								coverUrl: finalCoverUrl,
							}
							: b
					)
				)
			}
			await loadBooks()
			return { success: true }
		} catch (e) {
			setError(e?.message || "Unable to save book")
			return { success: false, message: e?.message || "Unable to save book" }
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteBook = async (book) => {
		if (!book?.id) return
		const ok = window.confirm(`Delete "${book.name || "this book"}"? This cannot be undone.`)
		if (!ok) return

		setError("")
		setLoading(true)
		try {
			const { data: copies, error: copiesError } = await supabase
				.from("book_copies")
				.select("id")
				.eq("book_id", book.id)
			if (copiesError) throw new Error(copiesError.message)

			const copyIds = (copies || []).map((c) => c.id).filter(Boolean)
			if (copyIds.length) {
				const { count: loanCount, error: loanError } = await supabase
					.from("loans")
					.select("id", { count: "exact", head: true })
					.in("copy_id", copyIds)
				if (loanError) throw new Error(loanError.message)
				if ((loanCount || 0) > 0) {
					throw new Error("Cannot delete: this book has loan history. Remove related loans/copies first.")
				}
			}

			await supabase.from("book_categories").delete().eq("book_id", book.id)
			await supabase.from("book_authors").delete().eq("book_id", book.id)
			await supabase.from("book_copies").delete().eq("book_id", book.id)

			const { error: deleteError } = await supabase
				.from("books")
				.delete()
				.eq("id", book.id)
			if (deleteError) throw new Error(deleteError.message)

			setSelectedBook(null)
			setBooks((prev) => prev.filter((b) => b.id !== book.id))
			await loadBooks()
			toast.success("Book deleted successfully")
		} catch (e) {
			const msg = e?.message || "Unable to delete book"
			setError(msg)
			toast.error(msg)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="page">

			<div className="page-header">
				<div>
					<h2>Books</h2>
					<div className="breadcrumb">Dashboard / Books</div>
				</div>

				<div className="page-actions">
					<input
						placeholder="Search books..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<button
						type="button"
						className="btn filter-btn"
						onClick={() => setFiltersOpen((v) => !v)}
					>
						Filter
					</button>
					<button
						type="button"
						className="primary"
						onClick={() => setAddOpen(true)}
					>
						Add Book
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
								{authorOptions.map((a) => (
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
								{categoryOptions.map((c) => (
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
				{!loading && !filteredBooksWithFilters.length ? (
					<div className="books-empty">No books found.</div>
				) : null}
				{filteredBooksWithFilters.map((book, i) => (
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
				role="admin"
				onClose={() => setSelectedBook(null)}
				onEdit={handleEditOpen}
				onDelete={handleDeleteBook}
			/>

			<AddBookModal
				isOpen={addOpen}
				onClose={() => setAddOpen(false)}
				onAdd={handleAddBook}
				categories={categoryOptions}
			/>

			<EditBookModal
				isOpen={editOpen}
				book={editBook}
				onClose={() => {
					setEditOpen(false)
					setEditBook(null)
				}}
				onSave={handleSaveBook}
				categories={categoryOptions}
			/>

		</div>
	)
}

export default Books