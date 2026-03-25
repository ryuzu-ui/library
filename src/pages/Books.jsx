function Books() {

	const books = [
		{ name: "Literature", author: "Wade Warren", id: "#0011", subject: "English", class: "02", date: "22 Oct, 2022" },
		{ name: "Mathematics", author: "David Morgan", id: "#0021", subject: "Math", class: "01", date: "12 Sep, 2023" },
		{ name: "English", author: "Kristin Watson", id: "#0031", subject: "Physics", class: "03", date: "23 Nov, 2020" },
	]

	return (
		<div className="books-page">

			{/* HEADER */}
			<div className="books-header">
				<div>
					<h2>Library</h2>
					<p className="breadcrumb">Home / Library Books</p>
				</div>

				<button className="primary">+ Add Book</button>
			</div>

			{/* TOP BAR */}
			<div className="books-topbar">
				<h3>All Books</h3>

				<div className="books-actions">
					<input placeholder="Search by name..." />
					<select>
						<option>Last 30 days</option>
					</select>
				</div>
			</div>

			{/* TABLE */}
			<div className="books-table">
				<table>
					<thead>
						<tr>
							<th></th>
							<th>Book Name</th>
							<th>Writer</th>
							<th>ID</th>
							<th>Subject</th>
							<th>Class</th>
							<th>Publish Date</th>
							<th>Action</th>
						</tr>
					</thead>

					<tbody>
						{books.map((book, i) => (
							<tr key={i}>
								<td><input type="checkbox" /></td>
								<td>{book.name}</td>
								<td>{book.author}</td>
								<td>{book.id}</td>
								<td>{book.subject}</td>
								<td>{book.class}</td>
								<td>{book.date}</td>
								<td>
									<button className="icon-btn">✏️</button>
									<button className="icon-btn delete">🗑</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

		</div>
	)
}

export default Books