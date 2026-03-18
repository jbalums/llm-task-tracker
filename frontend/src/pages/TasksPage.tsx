import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTasks } from "../lib/api";

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

	useEffect(() => {
		fetchTasks().then(setTasks);
	}, []);

	const selectedTask = tasks.find((t) => t.id === selectedId) || tasks[0];

	return (
		<div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
			<h1>Tasks</h1>
			<p>
				<Link to="/">Back to chat</Link>
			</p>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "300px 1fr",
					gap: 24,
				}}
			>
				<div style={{ border: "1px solid #ddd", padding: 16 }}>
					{tasks.map((task) => (
						<div
							key={task.id}
							onClick={() => setSelectedId(task.id)}
							style={{
								padding: 12,
								border: "1px solid #eee",
								marginBottom: 10,
								cursor: "pointer",
							}}
						>
							<div>
								<strong>{task.title}</strong>
							</div>
							<div>{task.status}</div>
						</div>
					))}
				</div>

				<div style={{ border: "1px solid #ddd", padding: 16 }}>
					{selectedTask ? (
						<>
							<h2>{selectedTask.title}</h2>
							<p>Status: {selectedTask.status}</p>
							<h3>Details</h3>
							{selectedTask.details.length ? (
								selectedTask.details.map((detail) => (
									<div
										key={detail.id}
										style={{
											marginBottom: 10,
											borderBottom: "1px solid #eee",
											paddingBottom: 8,
										}}
									>
										{detail.content}
									</div>
								))
							) : (
								<p>No details yet.</p>
							)}
						</>
					) : (
						<p>No tasks yet.</p>
					)}
				</div>
			</div>
		</div>
	);
}
