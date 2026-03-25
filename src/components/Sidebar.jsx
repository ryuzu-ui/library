import { NavLink } from "react-router-dom"

function Sidebar({ isOpen, role, toggleSidebar }) {

	const adminMenu = [
		{ name: "Dashboard", path: "/dashboard" },
		{ name: "Books", path: "/books" },
		{ name: "Users", path: "/users" },
	]

	const userMenu = [
		{ name: "Profile", path: "/profile" },
		{ name: "Borrow", path: "/borrow" },
		{ name: "Return", path: "/return" },
	]

	const menu = role === "admin" ? adminMenu : userMenu

	return (
		<div className={`sidebar ${isOpen ? "open" : ""}`}>

			{/* 🔝 HEADER */}
			<div className="sidebar-header">

				<button className="close-btn" onClick={toggleSidebar}>
					←
				</button>

				<h2>{role === "admin" ? "Admin Panel" : "User Panel"}</h2>
			</div>

			{/* 📋 MENU */}
			<ul className="menu">
				{menu.map((item, index) => (
					<li key={index}>
						<NavLink to={item.path} className="menu-link">
							{item.name}
						</NavLink>
					</li>
				))}
			</ul>

			{/* 🔻 FOOTER */}
			<div className="sidebar-footer">
				<p className="logout">Logout</p>
			</div>

		</div>
	)
}

export default Sidebar