import { userDashboardDummy } from "../data/userDashboardDummy"
import { useMemo, useState } from "react"

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

function UserDashboard() {
	const { kpis, readingActivity, myRecentActivity, recommendations, popularBooks } =
		userDashboardDummy
	const [activeTab, setActiveTab] = useState("recommended")

	const rightPanelBooks = useMemo(() => {
		return activeTab === "popular" ? popularBooks : recommendations
	}, [activeTab, popularBooks, recommendations])

	const chartW = 560
	const chartH = 220
	const chartPad = 18
	const borrowedPath = createPath(
		readingActivity.series.borrowed,
		chartW,
		chartH,
		chartPad
	)
	const returnedPath = createPath(
		readingActivity.series.returned,
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
						<h3>My reading activity</h3>
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
							{readingActivity.labels.map((label) => (
								<div key={label} className="chart-x-label">
									{label}
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="box right">
					<div className="pill-tabs">
						<button
							className={`pill ${activeTab === "recommended" ? "pill-active" : ""}`}
							onClick={() => setActiveTab("recommended")}
							type="button"
						>
							Recommended
						</button>
						<button
							className={`pill ${activeTab === "popular" ? "pill-active" : ""}`}
							onClick={() => setActiveTab("popular")}
							type="button"
						>
							Popular
						</button>
					</div>
					<div className="topbooks">
						{rightPanelBooks.map((b, idx) => (
							<div key={`${b.title}-${idx}`} className="topbook">
								<div className="topbook-title">{b.title}</div>
								<div className="topbook-author">{b.author}</div>
								<span className="status-pill">{b.status}</span>
							</div>
						))}
					</div>
				</div>

				<div className="box full">
					<div className="box-header">
						<h3>My recent borrows / returns</h3>
						<button className="link-btn">View All</button>
					</div>
					<div className="table-wrap">
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>Title</th>
									<th>Action</th>
									<th>Date</th>
									<th>Due</th>
								</tr>
							</thead>
							<tbody>
								{myRecentActivity.map((row, idx) => (
									<tr key={`${row.id}-${row.title}-${idx}`}>
										<td>{row.id}</td>
										<td className="truncate">{row.title}</td>
										<td>
											<span
												className={`badge ${row.action === "Returned" ? "green" : "red"}`}
											>
												{row.action}
											</span>
										</td>
										<td>{row.date}</td>
										<td>{row.due}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	)
}

export default UserDashboard
