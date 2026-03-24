function Sidebar({ isOpen, role, toggleSidebar }) {

	const adminMenu = [
		"Dashboard",
		"Books",
		"Users",
	]

	const userMenu = [
		"Profile",
		"Borrow",
		"Return",
	]

	const menu = role === "admin" ? adminMenu : userMenu

	return (
		<div className={`sidebar ${isOpen ? "open" : ""}`}>

			{/* 🔥 CLOSE BUTTON */}
			<button className="close-btn" onClick={toggleSidebar}>
				←
			</button>

			<h2>{role === "admin" ? "Admin Panel" : "User Panel"}</h2>

			<ul>
				{menu.map((item, index) => (
					<li key={index}>{item}</li>
				))}
			</ul>
		</div>
	)
}

export default Sidebar