// @ts-nocheck
import "./env";
import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chat";
import taskRoutes from "./routes/tasks";
import adminRoutes from "./routes/admin";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_req, res) => {
	res.json({ ok: true });
});

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
