import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTasks } from "../lib/api";
import "./ChatPage.css";
import "./TasksPage.css";

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

export default function TasksPage() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchTasks()
			.then((data: Task[]) => {
				setTasks(data);
				setSelectedId((current) => current ?? data[0]?.id ?? null);
			})
			.catch((fetchError: unknown) => {
				setError(
					fetchError instanceof Error
						? fetchError.message
						: "Failed to load tasks.",
				);
			});
	}, []);

	const selectedTask = tasks.find((task) => task.id === selectedId) ?? tasks[0] ?? null;
	const openCount = tasks.filter((task) => task.status === "OPEN").length;
	const completedCount = tasks.filter((task) => task.status === "COMPLETED").length;

	const recentLabel = useMemo(() => {
		if (!selectedTask) return "No task selected";
		return selectedTask.title.length > 32
			? `${selectedTask.title.slice(0, 32)}...`
			: selectedTask.title;
	}, [selectedTask]);

	return (
		<div className="grok-shell">
			<aside className="grok-sidebar">
				<div className="grok-brand">
					<div className="grok-brand-mark">LT</div>
					<div>
						<p className="grok-brand-label">LLM Task Tracker</p>
						<p className="grok-brand-subtitle">Execution board</p>
					</div>
				</div>

				<Link className="grok-sidebar-button grok-sidebar-button--primary" to="/">
					Back to chat
				</Link>

				<div className="grok-sidebar-section">
					<p className="grok-sidebar-heading">Workspace</p>
					<Link className="grok-sidebar-link" to="/">
						Chat console
					</Link>
					<div className="grok-recent-card tasks-sidebar-stats">
						<div>
							<p className="tasks-sidebar-stat-value">{tasks.length}</p>
							<p className="grok-recent-meta">Total tasks</p>
						</div>
						<div>
							<p className="tasks-sidebar-stat-value">{openCount}</p>
							<p className="grok-recent-meta">Open now</p>
						</div>
					</div>
				</div>

				<div className="grok-sidebar-section">
					<p className="grok-sidebar-heading">Selected</p>
					<div className="grok-recent-card">
						<p className="grok-recent-title">{recentLabel}</p>
						<p className="grok-recent-meta">
							{selectedTask
								? `${selectedTask.details.length} detail${
										selectedTask.details.length === 1 ? "" : "s"
								  }`
								: "Choose a task to inspect"}
						</p>
					</div>
				</div>

				<div className="grok-sidebar-footer">
					<p>
						{completedCount} completed, {openCount} still in flight.
					</p>
				</div>
			</aside>

			<main className="grok-main">
				<header className="grok-topbar">
					<div className="grok-topbar-pills">
						<span className="grok-pill">Task board</span>
						<span className="grok-pill">Details timeline</span>
					</div>
					<div className="grok-topbar-actions">
						<Link className="grok-ghost-link" to="/">
							Open chat
						</Link>
					</div>
				</header>

				<section className="tasks-stage">
					<div className="tasks-hero">
						<div className="grok-hero-badge">Workspace snapshot</div>
						<h1>Everything your operator is tracking.</h1>
						<p>
							Review active work, inspect task details, and move between chat
							and execution without leaving the same visual workspace.
						</p>
					</div>

					<div className="tasks-dashboard">
						<section className="tasks-panel tasks-panel--list">
							<div className="tasks-panel-header">
								<div>
									<p className="tasks-panel-eyebrow">Queue</p>
									<h2>Task stream</h2>
								</div>
								<div className="tasks-summary-badges">
									<span className="tasks-badge">{openCount} open</span>
									<span className="tasks-badge">{completedCount} done</span>
								</div>
							</div>

							{error ? <p className="tasks-empty-state">{error}</p> : null}

							{!error && tasks.length === 0 ? (
								<p className="tasks-empty-state">
									No tasks yet. Head back to chat and ask the assistant to create
									your first batch.
								</p>
							) : null}

							<div className="tasks-list">
								{tasks.map((task) => (
									<button
										key={task.id}
										type="button"
										className={`tasks-list-item${
											task.id === selectedTask?.id ? " tasks-list-item--active" : ""
										}`}
										onClick={() => setSelectedId(task.id)}
									>
										<div className="tasks-list-item-top">
											<span
												className={`tasks-status-dot tasks-status-dot--${task.status.toLowerCase()}`}
											/>
											<span className="tasks-list-item-status">{task.status}</span>
										</div>
										<p className="tasks-list-item-title">{task.title}</p>
										<p className="tasks-list-item-meta">
											{task.details.length} detail
											{task.details.length === 1 ? "" : "s"}
										</p>
									</button>
								))}
							</div>
						</section>

						<section className="tasks-panel tasks-panel--detail">
							{selectedTask ? (
								<>
									<div className="tasks-panel-header">
										<div>
											<p className="tasks-panel-eyebrow">Selected task</p>
											<h2>{selectedTask.title}</h2>
										</div>
										<span
											className={`tasks-status-pill tasks-status-pill--${selectedTask.status.toLowerCase()}`}
										>
											{selectedTask.status}
										</span>
									</div>

									<div className="tasks-detail-grid">
										<div className="tasks-detail-card">
											<p className="tasks-detail-label">Details</p>
											<p className="tasks-detail-value">
												{selectedTask.details.length}
											</p>
										</div>
										<div className="tasks-detail-card">
											<p className="tasks-detail-label">Task ID</p>
											<p className="tasks-detail-value tasks-detail-value--mono">
												{selectedTask.id.slice(0, 10)}
											</p>
										</div>
									</div>

									<div className="tasks-timeline">
										<p className="tasks-panel-eyebrow">Notes and details</p>

										{selectedTask.details.length ? (
											selectedTask.details.map((detail, index) => (
												<article key={detail.id} className="tasks-timeline-item">
													<div className="tasks-timeline-marker">
														<span>{index + 1}</span>
													</div>
													<div className="tasks-timeline-content">
														<p>{detail.content}</p>
													</div>
												</article>
											))
										) : (
											<p className="tasks-empty-state">
												No details attached yet for this task.
											</p>
										)}
									</div>
								</>
							) : (
								<div className="tasks-empty-wrap">
									<p className="tasks-empty-state">
										Select a task from the left to inspect its details.
									</p>
								</div>
							)}
						</section>
					</div>
				</section>
			</main>
		</div>
	);
}
