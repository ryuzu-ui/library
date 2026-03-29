import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import UserDashboard from "./pages/UserDashboard"
import Profile from "./pages/Profile"

import AdminLayout from "./layouts/AdminLayout"
import UserLayout from "./layouts/UserLayout"
import Books from "./pages/Books"
import Users from "./pages/Users"
import MyBooks from "./pages/MyBooks"
import Home from "./pages/Home"

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
					path="/user/dashboard"
					element={
						<UserLayout>
							<UserDashboard />
						</UserLayout>
					}
				/>

				<Route
					path="/user/home"
					element={
						<UserLayout>
							<Home />
						</UserLayout>
					}
				/>

				<Route
					path="/profile"
					element={
						<UserLayout>
							<Profile />
						</UserLayout>
					}
				/>

				<Route
					path="/books"
					element={
						<AdminLayout>
							<Books />
						</AdminLayout>
					}
				/>

				<Route
					path="/users"
					element={
						<AdminLayout>
							<Users />
						</AdminLayout>
					}
				/>

				<Route
					path="/my-books"
					element={
						<UserLayout>
							<MyBooks />
						</UserLayout>
					}
				/>
				
			</Routes>
		</BrowserRouter>
	)
}

export default App