import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

router.get("/", async (_req, res) => {
	const tasks = await prisma.task.findMany({
		orderBy: { createdAt: "desc" },
		include: {
			details: {
				orderBy: { createdAt: "asc" },
			},
		},
	});

	res.json(tasks);
});

router.get("/:id", async (req, res) => {
	const task = await prisma.task.findUnique({
		where: { id: req.params.id },
		include: {
			details: {
				orderBy: { createdAt: "asc" },
			},
		},
	});

	if (!task) {
		return res.status(404).json({ error: "Task not found" });
	}

	return res.json(task);
});

export default router;
