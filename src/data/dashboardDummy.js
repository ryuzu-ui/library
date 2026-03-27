export const dashboardDummy = {
	kpis: [
		{ id: "borrowed", label: "Borrowed Books", value: 2405, delta: 23, deltaType: "up" },
		{ id: "returned", label: "Returned Books", value: 783, delta: 14, deltaType: "down" },
		{ id: "overdue", label: "Overdue Books", value: 45, delta: 11, deltaType: "up" },
		{ id: "missing", label: "Missing Books", value: 12, delta: 11, deltaType: "up" },
		{ id: "total", label: "Total Books", value: 32345, delta: 11, deltaType: "up" },
		{ id: "visitors", label: "Visitors", value: 1504, delta: 3, deltaType: "up" },
		{ id: "newMembers", label: "New Members", value: 34, delta: 10, deltaType: "down" },
		{ id: "pendingFees", label: "Pending Fees", value: 765, delta: 56, deltaType: "up", format: "currency" },
	],
	checkoutStatistics: {
		labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		series: {
			borrowed: [2800, 4600, 3200, 3100, 3400, 2100, 3600],
			returned: [1500, 3200, 2400, 4500, 3900, 4200, 2800],
		},
	},
	overdueHistory: [
		{ memberId: "#48964", title: "Magnolia Palace", isbn: "3234", dueDate: "5", fine: "$10" },
		{ memberId: "#48964", title: "Don Quixote", isbn: "3234", dueDate: "5", fine: "$10" },
		{ memberId: "#48964", title: "Alice's Adventures in Wonderland", isbn: "3234", dueDate: "5", fine: "$10" },
		{ memberId: "#48964", title: "Pride and Prejudice", isbn: "3234", dueDate: "5", fine: "$10" },
		{ memberId: "#48964", title: "Treasure Island", isbn: "3234", dueDate: "5", fine: "$10" },
	],
	recentCheckouts: [
		{ id: "#48964", isbn: "3234", title: "Magnolia Palace", author: "Fiona Davis", member: "Phillip Workman", issuedDate: "5/2/2023", returnDate: "15/2/2023" },
		{ id: "#48964", isbn: "3234", title: "Don Quixote", author: "Miguel de Cervantes", member: "Kiana Donin", issuedDate: "5/2/2023", returnDate: "15/2/2023" },
		{ id: "#48964", isbn: "3234", title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", member: "Cristofer Bator", issuedDate: "3/2/2023", returnDate: "13/2/2023" },
		{ id: "#48964", isbn: "3234", title: "Pride and Prejudice", author: "Hanna Gouse", member: "Livia Kenter", issuedDate: "3/2/2023", returnDate: "13/2/2023" },
		{ id: "#48964", isbn: "3234", title: "Treasure Island", author: "Phillip Siphron", member: "Tatiana Arcand", issuedDate: "2/2/2023", returnDate: "12/2/2023" },
	],
	topBooks: [
		{ title: "Magnolia Palace", author: "Cristofer Bator", status: "Available" },
		{ title: "Don Quixote", author: "Aspen Siphron", status: "Available" },
		{ title: "Pride and Prejudice", author: "Kianna Geidt", status: "Available" },
	],
}
