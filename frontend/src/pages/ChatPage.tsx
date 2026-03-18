import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { sendChatMessage, resetSystem, fetchTasks } from "../lib/api";
import "./ChatPage.css";

type Msg = {
	role: "user" | "assistant";
	content: string;
};

type Task = {
	id: string;
	title: string;
	status: "OPEN" | "COMPLETED";
	createdAt: string;
	details: Array<{
		id: string;
		content: string;
		createdAt: string;
	}>;
};

const quickPrompts = [
	"Create the following task: dashboard page, login page, user profile page.",
	"Mark the dashboard task as complete.",
	"Add details to login page: set-up forms, validation, and error handling.",
	"What tasks are still open?",
];

export default function ChatPage() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const selectedTask =
		tasks.find((task) => task.id === selectedId) ?? tasks[0] ?? null;
	const openCount = tasks.filter((task) => task.status === "OPEN").length;
	const completedCount = tasks.filter(
		(task) => task.status === "COMPLETED",
	).length;

	const [text, setText] = useState("");
	const [messages, setMessages] = useState<Msg[]>([]);
	const [isSending, setIsSending] = useState(false);

	const hasMessages = messages.length > 0;
	const conversationTitle = useMemo(() => {
		const firstUserMessage = messages.find(
			(message) => message.role === "user",
		);
		if (!firstUserMessage) return "New workspace";

		if (firstUserMessage.content.length <= 36) {
			return firstUserMessage.content;
		}

		return `${firstUserMessage.content.slice(0, 36)}...`;
	}, [messages]);

	useEffect(() => {
		fetchAllTasks();
	}, []);
	const fetchAllTasks = async () => {
		try {
			fetchTasks()
				.then((data: Task[]) => {
					setTasks(data);
				})
				.catch((fetchError: unknown) => {
					setError(
						fetchError instanceof Error
							? fetchError.message
							: "Failed to load tasks.",
					);
				});
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to fetch tasks.",
			);
		}
	};

	async function handleSend() {
		if (!text.trim() || isSending) return;

		const userText = text.trim();
		setMessages((prev) => [...prev, { role: "user", content: userText }]);
		setText("");
		setIsSending(true);

		try {
			const result = await sendChatMessage(userText);
			setMessages((prev) => [
				...prev,
				{ role: "assistant", content: result.reply },
			]);
		} catch (error) {
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content:
						error instanceof Error
							? error.message
							: "Something went wrong.",
				},
			]);
		} finally {
			fetchAllTasks();
			setIsSending(false);
		}
	}

	function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			void handleSend();
		}
	}

	async function clearMessage() {
		setText("");
	}
	async function handleNewChat() {
		setMessages([]);
		setText("");
	}

	async function handleReset() {
		await resetSystem();
		setMessages([]);
		setText("");
	}

	return (
		<div className="grok-shell">
			<aside className="grok-sidebar">
				<div className="grok-brand">
					<div className="grok-brand-mark">LT</div>
					<div>
						<p className="grok-brand-label">LLM Task Tracker</p>
						<p className="grok-brand-subtitle">
							Operator workspace
						</p>
					</div>
				</div>

				<button
					className="grok-sidebar-button  grok-sidebar-button--primary"
					onClick={handleNewChat}
					type="button"
				>
					New chat
				</button>

				<div className="grok-sidebar-section">
					<p className="grok-sidebar-heading">Workspace</p>
					<Link className="grok-sidebar-link" to="/tasks">
						Task board
					</Link>
					<div className="grok-recent-card tasks-sidebar-stats">
						<div>
							<p className="tasks-sidebar-stat-value">
								{tasks.length}
							</p>
							<p className="grok-recent-meta">Total tasks</p>
						</div>
						<div>
							<p className="tasks-sidebar-stat-value">
								{openCount}
							</p>
							<p className="grok-recent-meta">Open now</p>
						</div>
					</div>
				</div>

				<div className="grok-sidebar-section">
					<p className="grok-sidebar-heading">Recent</p>
					<div className="grok-recent-card">
						<p className="grok-recent-title">{conversationTitle}</p>
						<p className="grok-recent-meta">
							{hasMessages
								? `${messages.length} message${messages.length === 1 ? "" : "s"}`
								: "No activity yet"}
						</p>
					</div>
				</div>

				<div className="grok-clear-button" onClick={handleReset}>
					Reset System
				</div>
			</aside>

			<main className="grok-main">
				<header className="grok-topbar">
					<div className="grok-topbar-pills">
						<span className="grok-pill">Task-aware agent</span>
						<span className="grok-pill">Live workspace</span>
					</div>
					<div className="grok-topbar-actions">
						<Link className="grok-ghost-link" to="/tasks">
							Open tasks
						</Link>
					</div>
				</header>

				<section
					className={`grok-stage${hasMessages ? " grok-stage--active" : ""}`}
				>
					{!hasMessages ? (
						<div className="grok-hero">
							<div className="grok-hero-badge">
								Built for operators
							</div>
							<h1>What do you want to ship next?</h1>
							<p>
								Plan work, complete tasks, and attach
								implementation details from a single command
								surface.
							</p>

							<div className="grok-prompt-grid">
								{quickPrompts.map((prompt) => (
									<button
										key={prompt}
										className="grok-prompt-card"
										onClick={() => setText(prompt)}
										type="button"
									>
										<span className="grok-prompt-card-label">
											Try
										</span>
										<span>{prompt}</span>
									</button>
								))}
							</div>
						</div>
					) : null}

					<div className="grok-thread" aria-live="polite">
						{messages.map((msg, index) => (
							<article
								key={`${msg.role}-${index}-${msg.content}`}
								className={`grok-message grok-message--${msg.role}`}
							>
								<div className="grok-message-meta">
									<span>
										{msg.role === "user"
											? "You"
											: "Assistant"}
									</span>
								</div>
								<p>{msg.content}</p>
							</article>
						))}

						{isSending ? (
							<article className="grok-message grok-message--assistant grok-message--pending">
								<div className="grok-message-meta">
									<span>Assistant</span>
								</div>
								<p>Thinking...</p>
							</article>
						) : null}
					</div>

					<div className="grok-composer-dock">
						<div className="grok-composer">
							<textarea
								value={text}
								onChange={(event) =>
									setText(event.target.value)
								}
								onKeyDown={handleComposerKeyDown}
								rows={3}
								placeholder="Ask anything about your tasks"
							/>

							<div className="grok-composer-toolbar">
								<div className="grok-tool-group">
									<button
										className="grok-tool-button"
										onClick={clearMessage}
										type="button"
									>
										Clear
									</button>
									<button
										className="grok-send-button"
										onClick={() => void handleSend()}
										type="button"
										disabled={!text.trim() || isSending}
									>
										Send
									</button>
								</div>
							</div>
						</div>

						<p className="grok-composer-note">
							Enter to send. Shift + Enter for a new line.
						</p>
					</div>
				</section>
			</main>
		</div>
	);
}
