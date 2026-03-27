export const userDashboardDummy = {
	kpis: [
		{ id: "borrowedNow", label: "Borrowed Now", value: 3, delta: 0, deltaType: "up" },
		{ id: "dueSoon", label: "Due Soon", value: 2, delta: 0, deltaType: "up" },
		{ id: "overdue", label: "Overdue", value: 1, delta: 0, deltaType: "down" },
		{ id: "finesDue", label: "Fines Due", value: 10, delta: 0, deltaType: "up", format: "currency" },
	],
	readingActivity: {
		labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		series: {
			borrowed: [0, 1, 0, 1, 0, 0, 1],
			returned: [0, 0, 1, 0, 1, 0, 0],
		},
	},
	myRecentActivity: [
		{ id: "#U-1001", title: "Magnolia Palace", action: "Borrowed", date: "5/2/2023", due: "15/2/2023" },
		{ id: "#U-1002", title: "Don Quixote", action: "Returned", date: "3/2/2023", due: "-" },
		{ id: "#U-1003", title: "Pride and Prejudice", action: "Borrowed", date: "2/2/2023", due: "12/2/2023" },
	],
	recommendations: [
		{ title: "Treasure Island", author: "R. L. Stevenson", status: "Available" },
		{ title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", status: "Available" },
		{ title: "The Hobbit", author: "J. R. R. Tolkien", status: "Available" },
	],
	popularBooks: [
		{ title: "1984", author: "George Orwell", status: "Popular" },
		{ title: "Harry Potter", author: "J. K. Rowling", status: "Popular" },
		{ title: "Romeo & Juliet", author: "William Shakespeare", status: "Popular" },
	],
}
