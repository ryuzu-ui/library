import { useState } from "react"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

function UserLayout({ children }) {
	const [isOpen, setIsOpen] = useState(false)

	const toggleSidebar = () => {
		setIsOpen(!isOpen)
	}

	const closeSidebar = () => {
		setIsOpen(false)
	}

	return (
		<div className={`app ${isOpen ? "sidebar-open" : ""}`}>
			<Sidebar
				isOpen={isOpen}
				role="user"
				toggleSidebar={toggleSidebar}
				onNavigate={closeSidebar}
			/>

			{isOpen ? (
				<div
					className="sidebar-backdrop"
					onClick={closeSidebar}
					aria-hidden="true"
				/>
			) : null}

			<div className="main">
				<Navbar toggleSidebar={toggleSidebar} />
				<div className="content">{children}</div>
			</div>
		</div>
	)
}

export default UserLayout