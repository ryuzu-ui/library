import { useEffect, useMemo, useState } from "react"
import { supabase } from "../lib/supabaseClient"

function Profile() {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [user, setUser] = useState(null)
	const [profile, setProfile] = useState(null)
	const [editing, setEditing] = useState(false)
	const [saving, setSaving] = useState(false)

	const [form, setForm] = useState({
		full_name: "",
		phone: "",
		address: "",
		avatar_url: "",
	})

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
				if (!authUser) throw new Error("You must be logged in")

				const { data: row, error: profileError } = await supabase
					.from("profiles")
					.select("id, full_name, phone, address, avatar_url, roles(name)")
					.eq("id", authUser.id)
					.maybeSingle()
				if (profileError) throw new Error(profileError.message)

				if (!active) return
				setUser(authUser)
				setProfile(row || null)
				setForm({
					full_name: row?.full_name || authUser.user_metadata?.full_name || "",
					phone: row?.phone || "",
					address: row?.address || "",
					avatar_url: row?.avatar_url || "",
				})
			} catch (e) {
				if (!active) return
				setError(e?.message || "Unable to load profile")
			} finally {
				if (active) setLoading(false)
			}
		}

		void load()
		return () => {
			active = false
		}
	}, [])

	const roleName = profile?.roles?.name || "user"
	const displayName = useMemo(() => {
		return form.full_name || user?.email || "User"
	}, [form.full_name, user?.email])

	const initials = useMemo(() => {
		const parts = String(displayName || "U")
			.trim()
			.split(/\s+/)
			.filter(Boolean)
		const first = parts[0]?.[0] || "U"
		const second = parts.length > 1 ? parts[1]?.[0] : ""
		return (first + second).toUpperCase()
	}, [displayName])

	const handleSave = async () => {
		setError("")
		setSaving(true)
		try {
			const {
				data: { user: authUser },
				error: userError,
			} = await supabase.auth.getUser()
			if (userError) throw new Error(userError.message)
			if (!authUser) throw new Error("You must be logged in")

			const payload = {
				id: authUser.id,
				full_name: form.full_name || null,
				phone: form.phone || null,
				address: form.address || null,
				avatar_url: form.avatar_url || null,
				updated_at: new Date().toISOString(),
			}

			const { data: saved, error: saveError } = await supabase
				.from("profiles")
				.upsert(payload)
				.select("id, full_name, phone, address, avatar_url, roles(name)")
				.maybeSingle()
			if (saveError) throw new Error(saveError.message)

			setProfile(saved || null)
			setEditing(false)
		} catch (e) {
			setError(e?.message || "Unable to save profile")
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="page">

			{/* HEADER */}
			<div className="page-header">
				<div>
					<h2>Profile</h2>
					<div className="breadcrumb">Dashboard / Profile</div>
				</div>
			</div>
			{error ? <p className="login-error">{error}</p> : null}
			{loading ? (
				<div style={{ padding: 10, color: "#666" }}>Loading profile...</div>
			) : null}

			<div className="profile-grid">

				{/* LEFT CARD */}
				<div className="profile-card">

					<h3>About Me</h3>

					<div className="profile-user">
						{form.avatar_url ? (
							<img src={form.avatar_url} alt={displayName} />
						) : (
							<div className="avatar" style={{ width: 60, height: 60, fontSize: 16 }}>
								{initials}
							</div>
						)}
						<div>
							<h4>{displayName}</h4>
							<span>{roleName}</span>
						</div>
					</div>

					<div className="profile-info">
						<div>
							<label>Full Name</label>
							{editing ? (
								<input
									value={form.full_name}
									onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
								/>
							) : (
								<p>{profile?.full_name || "-"}</p>
							)}
						</div>
						<div><label>Role</label><p>{roleName}</p></div>
						<div><label>Email</label><p>{user?.email || "-"}</p></div>
						<div>
							<label>Avatar URL</label>
							{editing ? (
								<input
									value={form.avatar_url}
									onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))}
								/>
							) : (
								<p className="truncate">{profile?.avatar_url || "-"}</p>
							)}
						</div>
					</div>

				</div>

				{/* RIGHT CARD */}
				<div className="profile-card">

					<h3>Contact Information</h3>

					<div className="profile-info">
						<div><label>Email</label><p>{user?.email || "-"}</p></div>
						<div>
							<label>Phone</label>
							{editing ? (
								<input
									value={form.phone}
									onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
								/>
							) : (
								<p>{profile?.phone || "-"}</p>
							)}
						</div>
						<div>
							<label>Address</label>
							{editing ? (
								<input
									value={form.address}
									onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
								/>
							) : (
								<p>{profile?.address || "-"}</p>
							)}
						</div>
					</div>

					<div className="profile-actions">
						{editing ? (
							<>
								<button className="btn" type="button" onClick={() => setEditing(false)}>
									Cancel
								</button>
								<button
									className="btn"
									type="button"
									onClick={handleSave}
									disabled={saving}
								>
									{saving ? "Saving..." : "Save"}
								</button>
							</>
						) : (
							<button className="btn" type="button" onClick={() => setEditing(true)}>
								Edit
							</button>
						)}
					</div>

				</div>

			</div>

		</div>
	)
}

export default Profile