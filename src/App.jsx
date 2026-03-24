import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile"

import AdminLayout from "./layouts/AdminLayout"
import UserLayout from "./layouts/UserLayout"

function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* LOGIN */}
				<Route path="/" element={<Login />} />

				{/* ADMIN */}
				<Route
					path="/dashboard"
					element={
						<AdminLayout>
							<Dashboard />
						</AdminLayout>
					}
				/>

				{/* USER */}
				<Route
					path="/profile"
					element={
						<UserLayout>
							<Profile />
						</UserLayout>
					}
				/>
			</Routes>
		</BrowserRouter>
	)
}

export default App