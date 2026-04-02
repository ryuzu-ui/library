import { NavLink, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"
import { useTheme } from "../context/ThemeContext"

function Sidebar({ isOpen, role, toggleSidebar, onNavigate }) {

	const navigate = useNavigate()
	const { theme, setTheme } = useTheme()

	const adminMenu = [
		{ name: "Dashboard", path: "/dashboard" },
		{ name: "Books", path: "/books" },
		{ name: "Users", path: "/users" },
	]

	const userMenu = [
		{ name: "Home", path: "/user/home" },
		{ name: "Dashboard", path: "/user/dashboard" },
		{ name: "Browse Books", path: "/user/browse" },
		{ name: "My Books", path: "/my-books" },
	]

	const menu = role === "admin" ? adminMenu : userMenu

	const handleLogout = async () => {
		try {
			await supabase.auth.signOut()
		} finally {
			if (typeof onNavigate === "function") onNavigate()
			navigate("/")
		}
	}

	return (
		<div className={`sidebar ${isOpen ? "open" : ""}`}>

			{/* 🔝 HEADER */}
			<div className="sidebar-header">
				<button className="close-btn" onClick={toggleSidebar}>
					←
				</button>
				<h2>Library App</h2>
			</div>

			{/* 📋 MENU */}
			<ul className="menu">
				{menu.map((item, index) => (
					<li key={index}>
						<NavLink
							to={item.path}
							className={({ isActive }) =>
								`menu-link ${isActive ? "active" : ""}`
							}
							onClick={() => {
								if (typeof onNavigate === "function") onNavigate()
							}}
						>
							{item.name}
						</NavLink>
					</li>
				))}
			</ul>

			{/* 🌙 THEME TOGGLE */}
			<div className="theme-toggle">
				<button onClick={() => setTheme("light")}>☀ Light</button>
				<button onClick={() => setTheme("dark")}>☾ Dark</button>
				<button onClick={() => setTheme("system")}>Auto</button>
			</div>

			{/* 🔻 FOOTER */}
			<div className="sidebar-footer">
				<p className="logout" onClick={handleLogout}>Logout</p>
			</div>

		</div>
	)
}

export default Sidebar