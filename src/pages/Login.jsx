import { useState } from "react"
import { useNavigate } from "react-router-dom"
import '../global.css'
import { supabase } from "../lib/supabaseClient"
import toast from "react-hot-toast"

function Login() {
	const [mode, setMode] = useState("login")
	const [fullName, setFullName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [error, setError] = useState("")
	const [message, setMessage] = useState("")
	const [loading, setLoading] = useState(false)
	const [heroImageOk, setHeroImageOk] = useState(true)
	const navigate = useNavigate()

	const resolveRoleAndRedirect = async () => {
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) {
			throw new Error("Unable to load user session")
		}

		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("id, roles(name)")
			.eq("id", user.id)
			.maybeSingle()

		if (profileError) {
			throw new Error(profileError.message)
		}

		const roleName = profile?.roles?.name
		if (roleName === "admin") {
			navigate("/dashboard")
			return
		}

		navigate("/user/dashboard")
	}

	const handleSubmit = async () => {
		setError("")
		setMessage("")

		const trimmedEmail = email.trim()
		if (!trimmedEmail || !password) {
			const msg = "Please enter your email and password"
			setError(msg)
			toast.error(msg)
			return
		}

		if (mode === "signup") {
			if (!fullName.trim()) {
				const msg = "Please enter your full name"
				setError(msg)
				toast.error(msg)
				return
			}

			if (password.length < 6) {
				const msg = "Password must be at least 6 characters"
				setError(msg)
				toast.error(msg)
				return
			}

			if (password !== confirmPassword) {
				const msg = "Passwords do not match"
				setError(msg)
				toast.error(msg)
				return
			}
		}

		setLoading(true)
		try {
			if (mode === "login") {
				const { error: signInError } = await supabase.auth.signInWithPassword({
					email: trimmedEmail,
					password,
				})

				if (signInError) {
					throw new Error(signInError.message)
				}

				await resolveRoleAndRedirect()
				toast.success("Logged in")
				return
			}

			const { data, error: signUpError } = await supabase.auth.signUp({
				email: trimmedEmail,
				password,
				options: {
					data: {
						full_name: fullName.trim(),
					},
				},
			})

			if (signUpError) {
				throw new Error(signUpError.message)
			}

			if (!data?.session) {
				const msg =
					"Account created. Please check your email to confirm your account, then log in."
				setMessage(msg)
				toast.success("Account created")
				setMode("login")
				setPassword("")
				setConfirmPassword("")
				return
			}

			await resolveRoleAndRedirect()
			toast.success("Account created")
		} catch (e) {
			const msg = e?.message || "Something went wrong"
			setError(msg)
			toast.error(msg)
		} finally {
			setLoading(false)
		}
	}

	const handleResetPassword = async () => {
		setError("")
		setMessage("")
		const trimmedEmail = email.trim()
		if (!trimmedEmail) {
			const msg = "Enter your email first"
			setError(msg)
			toast.error(msg)
			return
		}

		setLoading(true)
		try {
			const { error: resetError } = await supabase.auth.resetPasswordForEmail(
				trimmedEmail
			)
			if (resetError) {
				throw new Error(resetError.message)
			}
			const msg = "Password reset email sent. Please check your inbox."
			setMessage(msg)
			toast.success("Reset email sent")
		} catch (e) {
			const msg = e?.message || "Unable to send reset email"
			setError(msg)
			toast.error(msg)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="login-container">

			{/* LEFT SIDE */}
			<div className="login-left">
				<div className="auth-card">
					<div className="auth-header">
						<h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
						<p className="auth-subtitle">
							{mode === "login"
								? "Log in to continue to your dashboard"
								: "Sign up as a user. Admin access is granted manually."}
						</p>
					</div>

					<div className="auth-tabs">
						<button
							type="button"
							className={mode === "login" ? "auth-tab auth-tab-active" : "auth-tab"}
							onClick={() => {
								setMode("login")
								setError("")
								setMessage("")
							}}
							disabled={loading}
						>
							Log in
						</button>
						<button
							type="button"
							className={mode === "signup" ? "auth-tab auth-tab-active" : "auth-tab"}
							onClick={() => {
								setMode("signup")
								setError("")
								setMessage("")
							}}
							disabled={loading}
						>
							Sign up
						</button>
					</div>

					{mode === "signup" ? (
						<input
							type="text"
							placeholder="Full name"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							disabled={loading}
						/>
					) : null}

					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={loading}
					/>

					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={loading}
					/>

					{mode === "signup" ? (
						<input
							type="password"
							placeholder="Confirm password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							disabled={loading}
						/>
					) : null}

					{error ? <p className="login-error">{error}</p> : null}
					{message ? <p className="login-message">{message}</p> : null}

					<button className="primary" onClick={handleSubmit} disabled={loading}>
						{loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
					</button>

					{mode === "login" ? (
						<button
							type="button"
							className="auth-link"
							onClick={handleResetPassword}
							disabled={loading}
						>
							Forgot password?
						</button>
					) : null}
				</div>
			</div>

			{/* RIGHT SIDE */}
			<div className="login-right">
				<div className="auth-hero">
					<div className="auth-hero-card">
						{heroImageOk ? (
							<img
								className="auth-hero-image"
								src="/library-hero.png"
								alt="Library Management System"
								onError={() => setHeroImageOk(false)}
							/>
						) : (
							<svg
								className="library-icon"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									d="M5 4.5C5 3.11929 6.11929 2 7.5 2H19a1 1 0 0 1 1 1V18.5a2.5 2.5 0 0 0-2.5-2.5H7.5A2.5 2.5 0 0 0 5 18.5V4.5Z"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinejoin="round"
								/>
								<path
									d="M7.5 2H18v14H7.5A2.5 2.5 0 0 0 5 18.5"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinejoin="round"
								/>
								<path
									d="M9 6h6"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
								/>
								<path
									d="M9 9h6"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
								/>
							</svg>
						)}
						<div className="auth-hero-title">Library Management System</div>
						<div className="auth-hero-subtitle">
							A modern way to manage books, loans, and users.
						</div>
					</div>
				</div>
			</div>

		</div>
	)
}

export default Login