function Navbar({ toggleSidebar }) {
	return (
		<div className="topbar">
			<div className="topbar-left">
				<button className="icon-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
					☰
				</button>
				<div className="brand">Library App</div>
			</div>

			<div className="topbar-center">
				<input
					className="search"
					placeholder="Search Ex. ISBN, Title, Author, Member, etc"
				/>
			</div>

			<div className="topbar-right">
				<select className="range">
					<option>Last 6 months</option>
					<option>Last 30 days</option>
					<option>This week</option>
				</select>
				<button className="icon-btn" aria-label="Notifications">
					🔔
				</button>
				<div className="user">
					<div className="avatar">A</div>
					<div className="user-name">Allison</div>
				</div>
			</div>
		</div>
	)
}

export default Navbar