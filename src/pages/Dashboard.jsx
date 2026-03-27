import { dashboardDummy } from "../data/dashboardDummy"

function formatValue(kpi) {
	if (kpi.format === "currency") {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 0,
		}).format(kpi.value)
	}

	return new Intl.NumberFormat().format(kpi.value)
}

function createPath(values, width, height, padding) {
	if (!values.length) return ""

	const min = Math.min(...values)
	const max = Math.max(...values)
	const innerW = width - padding * 2
	const innerH = height - padding * 2
	const denom = max - min === 0 ? 1 : max - min

	return values
		.map((v, i) => {
			const x = padding + (i / (values.length - 1 || 1)) * innerW
			const y = padding + (1 - (v - min) / denom) * innerH
			return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
		})
		.join(" ")
}

function Dashboard() {
	const { kpis, checkoutStatistics, overdueHistory, recentCheckouts, topBooks } =
		dashboardDummy

	const chartW = 560
	const chartH = 220
	const chartPad = 18
	const borrowedPath = createPath(
		checkoutStatistics.series.borrowed,
		chartW,
		chartH,
		chartPad
	)
	const returnedPath = createPath(
		checkoutStatistics.series.returned,
		chartW,
		chartH,
		chartPad
	)

	return (
		<div className="dashboard">
			<div className="kpi-grid">
				{kpis.map((kpi) => {
					const deltaClass = kpi.deltaType === "down" ? "red" : "green"
					const deltaText = `${kpi.deltaType === "down" ? "-" : "+"}${kpi.delta}%`

					return (
						<div key={kpi.id} className="card kpi-card">
							<div className="kpi-label">{kpi.label}</div>
							<div className="kpi-value-row">
								<div className="kpi-value">{formatValue(kpi)}</div>
								<span className={`kpi-delta badge ${deltaClass}`}>{deltaText}</span>
							</div>
						</div>
					)
				})}
			</div>

			<div className="dashboard-grid">
				<div className="box">
					<div className="box-header">
						<h3>Check-out statistics</h3>
						<div className="legend">
							<span className="legend-item">
								<span className="dot dot-green"></span>
								Borrowed
							</span>
							<span className="legend-item">
								<span className="dot dot-red"></span>
								Returned
							</span>
						</div>
					</div>

					<div className="chart-wrap">
						<svg
							className="line-chart"
							viewBox={`0 0 ${chartW} ${chartH}`}
							preserveAspectRatio="none"
						>
							<path className="chart-path chart-green" d={borrowedPath} />
							<path className="chart-path chart-red" d={returnedPath} />
						</svg>
						<div className="chart-x">
							{checkoutStatistics.labels.map((label) => (
								<div key={label} className="chart-x-label">
									{label}
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="box">
					<h3>Overdue's History</h3>
					<div className="table-wrap">
						<table>
							<thead>
								<tr>
									<th>Member ID</th>
									<th>Title</th>
									<th>ISBN</th>
									<th>Due Date</th>
									<th>Fine</th>
								</tr>
							</thead>
							<tbody>
								{overdueHistory.map((row, idx) => (
									<tr key={`${row.memberId}-${row.title}-${idx}`}>
										<td>{row.memberId}</td>
										<td className="truncate">{row.title}</td>
										<td>{row.isbn}</td>
										<td>{row.dueDate}</td>
										<td>{row.fine}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				<div className="box full">
					<div className="box-header">
						<h3>Recent Check-out's</h3>
						<button className="link-btn">View All</button>
					</div>
					<div className="table-wrap">
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>ISBN</th>
									<th>Title</th>
									<th>Author</th>
									<th>Member</th>
									<th>Issued Date</th>
									<th>Return Date</th>
								</tr>
							</thead>
							<tbody>
								{recentCheckouts.map((row, idx) => (
									<tr key={`${row.id}-${row.title}-${idx}`}>
										<td>{row.id}</td>
										<td>{row.isbn}</td>
										<td className="truncate">{row.title}</td>
										<td className="truncate">{row.author}</td>
										<td className="truncate">{row.member}</td>
										<td>{row.issuedDate}</td>
										<td>{row.returnDate}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				<div className="box right">
					<div className="pill-tabs">
						<button className="pill pill-active">Top Books</button>
						<button className="pill">New arrivals</button>
					</div>
					<div className="topbooks">
						{topBooks.map((b, idx) => (
							<div key={`${b.title}-${idx}`} className="topbook">
								<div className="topbook-title">{b.title}</div>
								<div className="topbook-author">{b.author}</div>
								<span className="status-pill">{b.status}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default Dashboard