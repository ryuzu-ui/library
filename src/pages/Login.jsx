import { useState } from "react"
import { useNavigate } from "react-router-dom"
import '../global.css'

function Login() {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const navigate = useNavigate()

	const handleLogin = () => {
		if (username === "admin") {
			navigate("/dashboard")
		} else {
			navigate("/profile")
		}
	}

	return (
		<div className="login-container">

			{/* LEFT SIDE */}
			<div className="login-left">
				<h2>Log in</h2>

				<input
					type="text"
					placeholder="Username or Email"
					onChange={(e) => setUsername(e.target.value)}
				/>

				<input
					type="password"
					placeholder="Password"
					onChange={(e) => setPassword(e.target.value)}
				/>

				<button className="primary" onClick={handleLogin}>
					Log in
				</button>

				<p className="forgot">Forgot Password?</p>
			</div>

			{/* RIGHT SIDE */}
			<div className="login-right">
				<div className="illustration-placeholder">
					Books Image Here
				</div>
			</div>

		</div>
	)
}

export default Login