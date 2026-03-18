import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import TasksPage from "./pages/TasksPage";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<ChatPage />} />
				<Route path="/tasks" element={<TasksPage />} />
			</Routes>
		</BrowserRouter>
	);
}
