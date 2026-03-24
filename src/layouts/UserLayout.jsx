import { useState } from "react"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

function UserLayout({ children }) {
	const [isOpen, setIsOpen] = useState(false)

	const toggleSidebar = () => {
		setIsOpen(!isOpen)
	}

	return (
		<div className="app">
			<Sidebar isOpen={isOpen} role="user" toggleSidebar={toggleSidebar}/>

			<div className="main">
				<Navbar toggleSidebar={toggleSidebar} />
				<div className="content">{children}</div>
			</div>
		</div>
	)
}

export default UserLayout