import { useEffect, useMemo, useState } from "react"
import { supabase } from "../lib/supabaseClient"

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
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [kpis, setKpis] = useState([])
	const [checkoutStatistics, setCheckoutStatistics] = useState({
		labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		series: { borrowed: [0, 0, 0, 0, 0, 0, 0], returned: [0, 0, 0, 0, 0, 0, 0] },
	})
	const [overdueHistory, setOverdueHistory] = useState([])
	const [recentCheckouts, setRecentCheckouts] = useState([])
	const [topBooks, setTopBooks] = useState([])

	useEffect(() => {
		let active = true
		const load = async () => {
			setError("")
			setLoading(true)
			try {
				const now = new Date()
				const nowMs = now.getTime()
				const dayMs = 24 * 60 * 60 * 1000

				const last7Dates = []
				const labels = []
				for (let i = 6; i >= 0; i -= 1) {
					const d = new Date(nowMs - i * dayMs)
					last7Dates.push(d)
					labels.push(d.toLocaleDateString(undefined, { weekday: "short" }))
				}

				const [{ count: booksCount, error: booksCountError }, { data: loans, error: loansError }] =
					await Promise.all([
						supabase.from("books").select("id", { count: "exact", head: true }),
						supabase
							.from("loans")
							.select(
								"id, user_id, checked_out_at, due_at, returned_at, copy_id, book_copies:copy_id(id, books(id, title, book_authors(authors(name))))"
							)
							.order("checked_out_at", { ascending: false })
							.limit(300),
					])

				if (booksCountError) throw new Error(booksCountError.message)
				if (loansError) throw new Error(loansError.message)

				const allLoans = loans || []
				const activeLoans = allLoans.filter((l) => !l?.returned_at)
				const returnedLoans = allLoans.filter((l) => !!l?.returned_at)
				const overdueLoans = activeLoans.filter((l) => {
					if (!l?.due_at) return false
					const dueMs = new Date(l.due_at).getTime()
					return !Number.isNaN(dueMs) && dueMs < nowMs
				})

				const uniqueUserIds = Array.from(
					new Set(allLoans.map((l) => l?.user_id).filter(Boolean))
				)
				let profilesById = {}
				if (uniqueUserIds.length) {
					const { data: profiles, error: profilesError } = await supabase
						.from("profiles")
						.select("id, full_name")
						.in("id", uniqueUserIds)
					if (profilesError) {
						profilesById = {}
					} else {
						profilesById = Object.fromEntries(
							(profiles || []).map((p) => [p.id, p])
						)
					}
				}

				const borrowedSeries = []
				const returnedSeries = []
				for (const d of last7Dates) {
					const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
					const end = start + dayMs
					borrowedSeries.push(
						allLoans.filter((l) => {
							if (!l?.checked_out_at) return false
							const t = new Date(l.checked_out_at).getTime()
							return !Number.isNaN(t) && t >= start && t < end
						}).length
					)
					returnedSeries.push(
						allLoans.filter((l) => {
							if (!l?.returned_at) return false
							const t = new Date(l.returned_at).getTime()
							return !Number.isNaN(t) && t >= start && t < end
						}).length
					)
				}

				const topBookCounts = new Map()
				for (const l of allLoans) {
					const b = l?.book_copies?.books
					if (!b?.id) continue
					const key = b.id
					topBookCounts.set(key, {
						id: b.id,
						title: b.title,
						author:
							(b.book_authors || [])
								.map((ba) => ba?.authors?.name)
								.filter(Boolean)
								.join(", ") || "Unknown",
						count: (topBookCounts.get(key)?.count || 0) + 1,
					})
				}
				const topBooksArr = Array.from(topBookCounts.values())
					.sort((a, b) => b.count - a.count)
					.slice(0, 5)
					.map((b) => ({
						title: b.title,
						author: b.author,
						status: `${b.count} loans`,
					}))

				const overdueRows = overdueLoans.slice(0, 10).map((l) => {
					const title = l?.book_copies?.books?.title || "Unknown"
					const memberName =
						profilesById?.[l.user_id]?.full_name ||
						String(l.user_id || "-").slice(0, 8)
					const dueDate = l?.due_at ? new Date(l.due_at).toLocaleDateString() : "-"
					return {
						memberId: memberName,
						title,
						isbn: "-",
						dueDate,
						fine: "-",
					}
				})

				const recentRows = allLoans.slice(0, 12).map((l) => {
					const b = l?.book_copies?.books
					const author =
						(b?.book_authors || [])
							.map((ba) => ba?.authors?.name)
							.filter(Boolean)
							.join(", ") || "Unknown"
					const memberName =
						profilesById?.[l.user_id]?.full_name ||
						String(l.user_id || "-").slice(0, 8)
					return {
						id: `#L-${l.id}`,
						isbn: "-",
						title: b?.title || "Unknown",
						author,
						member: memberName,
						issuedDate: l?.checked_out_at
							? new Date(l.checked_out_at).toLocaleDateString()
							: "-",
						returnDate: l?.returned_at
							? new Date(l.returned_at).toLocaleDateString()
							: "-",
					}
				})

				const nextKpis = [
					{ id: "totalBooks", label: "Total Books", value: booksCount || 0, delta: 0, deltaType: "up" },
					{ id: "activeLoans", label: "Borrowed Books", value: activeLoans.length, delta: 0, deltaType: "up" },
					{ id: "returned", label: "Returned Books", value: returnedLoans.length, delta: 0, deltaType: "up" },
					{ id: "overdue", label: "Overdue Books", value: overdueLoans.length, delta: 0, deltaType: "down" },
				]

				if (!active) return
				setKpis(nextKpis)
				setCheckoutStatistics({ labels, series: { borrowed: borrowedSeries, returned: returnedSeries } })
				setOverdueHistory(overdueRows)
				setRecentCheckouts(recentRows)
				setTopBooks(topBooksArr)
			} catch (e) {
				if (!active) return
				setError(e?.message || "Unable to load dashboard")
			} finally {
				if (active) setLoading(false)
			}
		}

		void load()
		return () => {
			active = false
		}
	}, [])

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
			{error ? <p className="login-error">{error}</p> : null}
			{loading ? (
				<div style={{ padding: 10, color: "#666" }}>Loading dashboard...</div>
			) : null}
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