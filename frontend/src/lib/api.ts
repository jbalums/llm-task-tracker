const API_URL = import.meta.env.VITE_API_URL;

async function readErrorMessage(res: Response) {
	try {
		const data = await res.json();
		if (typeof data?.error === "string" && data.error.trim()) {
			return data.error;
		}
	} catch {
		// Ignore JSON parsing failures and fall back to status text.
	}

	return `Request failed with status ${res.status}`;
}

export async function sendChatMessage(text: string) {
	const messageId = crypto.randomUUID();

	const res = await fetch(`${API_URL}/chat`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			messageId,
			text,
		}),
	});

	if (!res.ok) {
		throw new Error(await readErrorMessage(res));
	}

	return res.json();
}

export async function fetchTasks() {
	const res = await fetch(`${API_URL}/tasks`);
	if (!res.ok) throw new Error("Failed to load tasks");
	return res.json();
}

export async function fetchTask(id: string) {
	const res = await fetch(`${API_URL}/tasks/${id}`);
	if (!res.ok) throw new Error("Failed to load task");
	return res.json();
}

export async function resetSystem() {
	const res = await fetch(`${API_URL}/admin/reset`, {
		method: "POST",
	});
	if (!res.ok) throw new Error("Failed to reset system");
	return res.json();
}
