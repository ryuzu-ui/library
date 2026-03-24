function Dashboard() {
	return (
		<div>

			{/* CARDS */}
			<div className="cards">
				<div className="card">
					<h4>Available Books</h4>
					<h2>2405</h2>
				</div>

				<div className="card">
					<h4>Borrowed Books</h4>
					<h2>783</h2>
				</div>

				<div className="card">
					<h4>Overdue Books</h4>
					<h2>45</h2>
				</div>

				<div className="card">
					<h4>Missing Books</h4>
					<h2>12</h2>
				</div>
			</div>

			{/* GRID */}
			<div className="grid">

				{/* CHART */}
				<div className="box">
					<h3>Checkout Statistics</h3>

					{/* simple fake chart */}
					<div className="chart">
						<div className="line green"></div>
						<div className="line red"></div>
					</div>
				</div>

				{/* SIDE STATS */}
				<div className="box">
					<h3>Overdue History</h3>

					<div className="side-item">The Hobbit</div>
					<div className="side-item">Don Quixote</div>
					<div className="side-item">Romeo & Juliet</div>
				</div>

				{/* TABLE */}
				<div className="box full">
					<h3>Recent Checkouts</h3>

					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Book</th>
								<th>Member</th>
								<th>Status</th>
							</tr>
						</thead>

						<tbody>
							<tr>
								<td>#1234</td>
								<td>Harry Potter</td>
								<td>John Doe</td>
								<td><span className="badge green">Returned</span></td>
							</tr>

							<tr>
								<td>#1235</td>
								<td>1984</td>
								<td>Jane Smith</td>
								<td><span className="badge red">Overdue</span></td>
							</tr>

							<tr>
								<td>#1236</td>
								<td>The Hobbit</td>
								<td>Mike Ross</td>
								<td><span className="badge green">Returned</span></td>
							</tr>
						</tbody>
					</table>
				</div>

			</div>

		</div>
	)
}

export default Dashboard