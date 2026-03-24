function Navbar({ toggleSidebar }) {
	return (
		<div className="topbar">
			<button onClick={toggleSidebar}>☰</button>
			<input className="search" placeholder="Search..." />
			<h3>Library</h3>
		</div>
	)
}

export default Navbar