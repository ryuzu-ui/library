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

function UserDashboard() {
	const [activeTab, setActiveTab] = useState("recommended")
	const [recommended, setRecommended] = useState([])
	const [popular, setPopular] = useState([])
	const [kpis, setKpis] = useState([])
	const [readingActivity, setReadingActivity] = useState({
		labels: [],
		series: { borrowed: [], returned: [] },
	})
	const [myRecentActivity, setMyRecentActivity] = useState([])
	const [error, setError] = useState("")

	const rightPanelBooks = useMemo(() => {
		return activeTab === "popular" ? popular : recommended
	}, [activeTab, popular, recommended])

	useEffect(() => {
		const load = async () => {
			setError("")
			try {
				const { data, error: booksError } = await supabase
					.from("books")
					.select("id, title, created_at, book_authors(authors(name))")
					.order("created_at", { ascending: false })
					.limit(30)
				if (booksError) throw new Error(booksError.message)

				const mapped = (data || []).map((b) => {
					const authorNames = (b.book_authors || [])
						.map((ba) => ba?.authors?.name)
						.filter(Boolean)
					return {
						title: b.title,
						author: authorNames.length ? authorNames.join(", ") : "Unknown",
						status: "Available",
					}
				})

				setRecommended(mapped.slice(0, 5))
				setPopular(mapped.slice(5, 10))
			} catch (e) {
				setError(e?.message || "Unable to load books")
			}
		}

		void load()
	}, [])

	useEffect(() => {
		const loadLoans = async () => {
			setError("")
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
						"id, checked_out_at, due_at, returned_at, copy_id, book_copies:copy_id(id, books(title))"
					)
					.eq("user_id", user.id)
					.order("checked_out_at", { ascending: false })
					.limit(50)
				if (loansError) throw new Error(loansError.message)

				const now = new Date()
				const nowMs = now.getTime()
				const dayMs = 24 * 60 * 60 * 1000
				const dueSoonThresholdMs = nowMs + 3 * dayMs

				const loans = data || []
				const activeLoans = loans.filter((l) => !l?.returned_at)
				const borrowedNow = activeLoans.length
				let dueSoon = 0
				let overdue = 0
				for (const l of activeLoans) {
					if (!l?.due_at) continue
					const dueMs = new Date(l.due_at).getTime()
					if (Number.isNaN(dueMs)) continue
					if (dueMs < nowMs) overdue += 1
					else if (dueMs <= dueSoonThresholdMs) dueSoon += 1
				}

				setKpis([
					{ id: "borrowedNow", label: "Borrowed Now", value: borrowedNow, delta: 0, deltaType: "up" },
					{ id: "dueSoon", label: "Due Soon", value: dueSoon, delta: 0, deltaType: "up" },
					{ id: "overdue", label: "Overdue", value: overdue, delta: 0, deltaType: "down" },
					{ id: "finesDue", label: "Fines Due", value: 0, delta: 0, deltaType: "up", format: "currency" },
				])

				const last7Labels = []
				const borrowedSeries = []
				const returnedSeries = []
				for (let i = 6; i >= 0; i -= 1) {
					const d = new Date(nowMs - i * dayMs)
					last7Labels.push(
						d.toLocaleDateString(undefined, { weekday: "short" })
					)
					const yyyy = d.getFullYear()
					const mm = d.getMonth()
					const dd = d.getDate()
					const start = new Date(yyyy, mm, dd).getTime()
					const end = start + dayMs
					borrowedSeries.push(
						loans.filter((l) => {
							if (!l?.checked_out_at) return false
							const t = new Date(l.checked_out_at).getTime()
							return !Number.isNaN(t) && t >= start && t < end
						}).length
					)
					returnedSeries.push(
						loans.filter((l) => {
							if (!l?.returned_at) return false
							const t = new Date(l.returned_at).getTime()
							return !Number.isNaN(t) && t >= start && t < end
						}).length
					)
				}

				setReadingActivity({
					labels: last7Labels,
					series: {
						borrowed: borrowedSeries,
						returned: returnedSeries,
					},
				})

				const recent = loans.slice(0, 10).map((l) => {
					const title = l?.book_copies?.books?.title || "Unknown"
					const action = l?.returned_at ? "Returned" : "Borrowed"
					const actionDate = l?.returned_at
						? new Date(l.returned_at).toLocaleDateString()
						: l?.checked_out_at
							? new Date(l.checked_out_at).toLocaleDateString()
							: "-"
					const due = l?.due_at ? new Date(l.due_at).toLocaleDateString() : "-"
					return {
						id: `#L-${l.id}`,
						title,
						action,
						date: actionDate,
						due,
					}
				})
				setMyRecentActivity(recent)
			} catch (e) {
				setError(e?.message || "Unable to load loans")
			}
		}

		void loadLoans()
	}, [])

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
			{error ? <p className="login-error">{error}</p> : null}
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
