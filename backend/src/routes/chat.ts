import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { findProcessedMessage } from "../services/idempotency";
import { interpretMessage } from "../services/llm";
import { executeAction } from "../services/taskExecutor";

const router = Router();

const BodySchema = z.object({
	messageId: z.string().min(1),
	text: z.string().min(1),
});

router.post("/", async (req, res) => {
	try {
		const body = BodySchema.parse(req.body);

		const existing = await findProcessedMessage(body.messageId);
		if (existing) {
			return res.json({
				reply: existing.responseSummary,
				reused: true,
			});
		}

		await prisma.chatMessage.create({
			data: {
				messageId: body.messageId,
				role: "USER",
				content: body.text,
			},
		});

		const tasks = await prisma.task.findMany({
			orderBy: { createdAt: "asc" },
			select: { id: true, title: true, status: true },
		});

		const recentMessages = await prisma.chatMessage.findMany({
			orderBy: { createdAt: "desc" },
			take: 6,
			select: { role: true, content: true },
		});

		const action = await interpretMessage({
			userMessage: body.text,
			tasks,
			recentMessages: recentMessages.reverse().map((m) => ({
				role: m.role.toLowerCase(),
				content: m.content,
			})),
		});

		const result = await executeAction({
			action,
			sourceMessageId: body.messageId,
		});

		const assistantMessageId = `${body.messageId}-assistant`;

		await prisma.chatMessage.create({
			data: {
				messageId: assistantMessageId,
				role: "ASSISTANT",
				content: result.summary,
			},
		});

		await prisma.processedMessage.create({
			data: {
				messageId: body.messageId,
				rawContent: body.text,
				normalizedHash: body.text.trim().toLowerCase(),
				responseSummary: result.summary,
				actionType: result.actionType,
			},
		});

		return res.json({
			reply: result.summary,
			reused: false,
		});
	} catch (error) {
		console.error(error);

		if (error instanceof z.ZodError) {
			return res.status(400).json({
				error: "Invalid chat request payload.",
			});
		}

		return res.status(500).json({
			error:
				error instanceof Error
					? error.message
					: "Failed to process message.",
		});
	}
});

export default router;
