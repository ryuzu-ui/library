import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

function Navbar({ toggleSidebar }) {
	const navigate = useNavigate()
	const popoverRef = useRef(null)
	const [profileOpen, setProfileOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [user, setUser] = useState(null)
	const [profile, setProfile] = useState(null)

	useEffect(() => {
		let active = true
		const load = async () => {
			setError("")
			setLoading(true)
			try {
				const {
					data: { user: authUser },
					error: userError,
				} = await supabase.auth.getUser()
				if (userError) throw new Error(userError.message)
				if (!authUser) {
					if (active) setUser(null)
					return
				}

				const { data: profileRow, error: profileError } = await supabase
					.from("profiles")
					.select("id, full_name, avatar_url, roles(name)")
					.eq("id", authUser.id)
					.maybeSingle()
				if (profileError) throw new Error(profileError.message)

				if (!active) return
				setUser(authUser)
				setProfile(profileRow || null)
			} catch (e) {
				if (!active) return
				setError(e?.message || "Unable to load user")
			} finally {
				if (active) setLoading(false)
			}
		}

		void load()
		return () => {
			active = false
		}
	}, [])

	useEffect(() => {
		if (!profileOpen) return

		const onKeyDown = (e) => {
			if (e.key === "Escape") setProfileOpen(false)
		}
		const onMouseDown = (e) => {
			const el = popoverRef.current
			if (!el) return
			if (el.contains(e.target)) return
			setProfileOpen(false)
		}

		document.addEventListener("keydown", onKeyDown)
		document.addEventListener("mousedown", onMouseDown)
		return () => {
			document.removeEventListener("keydown", onKeyDown)
			document.removeEventListener("mousedown", onMouseDown)
		}
	}, [profileOpen])

	const displayName = useMemo(() => {
		const profileName = profile?.full_name
		if (profileName) return profileName
		const metaName = user?.user_metadata?.full_name
		if (metaName) return metaName
		const email = user?.email
		if (email) return email.split("@")[0]
		return "User"
	}, [profile?.full_name, user])

	const initials = useMemo(() => {
		const parts = String(displayName || "U")
			.trim()
			.split(/\s+/)
			.filter(Boolean)
		const first = parts[0]?.[0] || "U"
		const second = parts.length > 1 ? parts[1]?.[0] : ""
		return (first + second).toUpperCase()
	}, [displayName])

	const roleName = profile?.roles?.name || "user"
	const avatarUrl = profile?.avatar_url || ""

	const handleLogout = async () => {
		try {
			await supabase.auth.signOut()
		} finally {
			setProfileOpen(false)
			navigate("/")
		}
	}

	return (
		<div className="topbar">
			<div className="topbar-left">
				<button className="icon-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
					☰
				</button>
				<div className="brand">Library App</div>
			</div>

			<div className="topbar-center">
				<input
					className="search"
					placeholder="Search Ex. ISBN, Title, Author, Member, etc"
				/>
			</div>

			<div className="topbar-right">
				<select className="range">
					<option>Last 6 months</option>
					<option>Last 30 days</option>
					<option>This week</option>
				</select>
				<button className="icon-btn" aria-label="Notifications">
					🔔
				</button>
				<div className="profile-popover" ref={popoverRef}>
					<button
						className="user user-btn"
						onClick={() => setProfileOpen((v) => !v)}
						type="button"
						aria-haspopup="dialog"
						aria-expanded={profileOpen}
					>
						<div className="avatar">
							{avatarUrl ? (
								<img src={avatarUrl} alt={displayName} className="avatar-img" />
							) : (
								initials
							)}
						</div>
						<div className="user-name">{displayName}</div>
					</button>

					{profileOpen ? (
						<div className="profile-card-popover" role="dialog" aria-label="Profile">
							{error ? <div className="login-error">{error}</div> : null}
							<div className="profile-card-header">
								<div className="profile-card-avatar">
									{avatarUrl ? (
										<img src={avatarUrl} alt={displayName} className="avatar-img" />
									) : (
										initials
									)}
								</div>
								<div className="profile-card-header-text">
									<div className="profile-card-title">Signed in</div>
									<div className="profile-card-name">{displayName}</div>
									<div className="profile-card-email">{user?.email || ""}</div>
								</div>
							</div>
							<div className="profile-card-meta">Role: {roleName}</div>
							{loading ? (
								<div className="muted" style={{ marginTop: 8 }}>
									Loading...
								</div>
							) : null}
							<div className="profile-card-actions">
								<button
									className="btn"
									type="button"
									onClick={() => {
										setProfileOpen(false)
										navigate("/profile")
									}}
								>
									View Profile
								</button>
								<button
									className="btn delete"
									type="button"
									onClick={handleLogout}
								>
									Logout
								</button>
							</div>
						</div>
					) : null}
				</div>
			</div>
		</div>
	)
}

export default Navbar