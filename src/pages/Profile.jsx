function Profile() {

	return (
		<div className="page">

			{/* HEADER */}
			<div className="page-header">
				<div>
					<h2>Profile</h2>
					<div className="breadcrumb">Dashboard / Profile</div>
				</div>
			</div>

			<div className="profile-grid">

				{/* LEFT CARD */}
				<div className="profile-card">

					<h3>About Me</h3>

					<div className="profile-user">
						<img src="https://i.pravatar.cc/80" />
						<div>
							<h4>John Doe</h4>
							<span>User</span>
						</div>
					</div>

					<div className="profile-info">
						<div><label>First Name</label><p>John</p></div>
						<div><label>Last Name</label><p>Doe</p></div>
						<div><label>Date of Birth</label><p>01-01-2000</p></div>
						<div><label>Role</label><p>Member</p></div>
					</div>

				</div>

				{/* RIGHT CARD */}
				<div className="profile-card">

					<h3>Contact Information</h3>

					<div className="profile-info">
						<div><label>Email</label><p>john@gmail.com</p></div>
						<div><label>Phone</label><p>09123456789</p></div>
						<div><label>Address</label><p>Manila</p></div>
					</div>

					<div className="profile-actions">
						<button className="btn">Edit</button>
					</div>

				</div>

			</div>

		</div>
	)
}

export default Profile