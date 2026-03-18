import { useState } from "react";
import { Link } from "react-router-dom";
import { sendChatMessage, resetSystem } from "../lib/api";

type Msg = {
	role: "user" | "assistant";
	content: string;
};

export default function ChatPage() {
	const [text, setText] = useState("");
	const [messages, setMessages] = useState<Msg[]>([]);

	async function handleSend() {
		if (!text.trim()) return;

		const userText = text.trim();
		setMessages((prev) => [...prev, { role: "user", content: userText }]);
		setText("");

		try {
			const result = await sendChatMessage(userText);
			setMessages((prev) => [
				...prev,
				{ role: "assistant", content: result.reply },
			]);
		} catch {
			setMessages((prev) => [
				...prev,
				{ role: "assistant", content: "Something went wrong." },
			]);
		}
	}

	async function handleReset() {
		await resetSystem();
		setMessages([]);
	}

	return (
		<div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
			<h1>LLM Task Tracker</h1>
			<p>
				<Link to="/tasks">View tasks</Link>
			</p>

			<div
				style={{
					border: "1px solid #ddd",
					padding: 16,
					minHeight: 300,
					marginBottom: 16,
				}}
			>
				{messages.map((msg, index) => (
					<div key={index} style={{ marginBottom: 12 }}>
						<strong>
							{msg.role === "user" ? "You" : "Assistant"}:
						</strong>{" "}
						{msg.content}
					</div>
				))}
			</div>

			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
				rows={4}
				style={{ width: "100%", marginBottom: 12 }}
				placeholder="Type something like: Create tasks for login, dashboard, and docs"
			/>

			<div style={{ display: "flex", gap: 12 }}>
				<button onClick={handleSend}>Send</button>
				<button onClick={handleReset}>Reset</button>
			</div>
		</div>
	);
}
