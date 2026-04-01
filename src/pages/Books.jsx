import { useEffect, useMemo, useState } from "react"
import BookDetailsModal from "./BookDetailsModal"
import AddBookModal from "./AddBookModal"
import { supabase } from "../lib/supabaseClient"


function Books() {

	const [selectedBook, setSelectedBook] = useState(null)
	const [addOpen, setAddOpen] = useState(false)
	const [search, setSearch] = useState("")
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
					"id, title, publication_year, cover_url, book_authors(authors(name))"
				)
				.order("created_at", { ascending: false })

			if (booksError) throw new Error(booksError.message)

			const mapped = (data || []).map((b) => {
				const authorNames = (b.book_authors || [])
					.map((ba) => ba?.authors?.name)
					.filter(Boolean)
				const author = authorNames.length ? authorNames.join(", ") : "Unknown"
				const date = b.publication_year
					? `Published: ${b.publication_year}`
					: ""

				return {
					id: b.id,
					name: b.title,
					author,
					date,
					image: b.cover_url || placeholderCover,
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

	const filteredBooks = useMemo(() => {
		const q = search.trim().toLowerCase()
		if (!q) return books
		return books.filter((b) => {
			const hay = `${b.name} ${b.author}`.toLowerCase()
			return hay.includes(q)
		})
	}, [books, search])

	const handleAddBook = async (newBook) => {
		setError("")
		setLoading(true)
		try {
			const title = (newBook?.name || "").trim()
			const authorName = (newBook?.author || "").trim()
			const coverUrl = (newBook?.image || "").trim()
			const coverFile = newBook?.coverFile ?? null
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

				const { error: updateCoverError } = await supabase
					.from("books")
					.update({ cover_url: publicUrl })
					.eq("id", upsertedBook.id)

				if (updateCoverError) throw new Error(updateCoverError.message)
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
						className="primary"
						onClick={() => setAddOpen(true)}
					>
						Add Book
					</button>
				</div>
			</div>

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
			/>

			<AddBookModal
				isOpen={addOpen}
				onClose={() => setAddOpen(false)}
				onAdd={handleAddBook}
			/>

		</div>
	)
}

export default Books