import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

router.post("/reset", async (_req, res) => {
	await prisma.taskDetail.deleteMany();
	await prisma.task.deleteMany();
	await prisma.chatMessage.deleteMany();
	await prisma.processedMessage.deleteMany();

	res.json({ ok: true });
});

export default router;
