"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../prisma");
const idempotency_1 = require("../services/idempotency");
const llm_1 = require("../services/llm");
const taskExecutor_1 = require("../services/taskExecutor");
const router = (0, express_1.Router)();
const BodySchema = zod_1.z.object({
    messageId: zod_1.z.string().min(1),
    text: zod_1.z.string().min(1),
});
router.post("/", async (req, res) => {
    try {
        const body = BodySchema.parse(req.body);
        const existing = await (0, idempotency_1.findProcessedMessage)(body.messageId);
        if (existing) {
            return res.json({
                reply: existing.responseSummary,
                reused: true,
            });
        }
        await prisma_1.prisma.chatMessage.create({
            data: {
                messageId: body.messageId,
                role: "USER",
                content: body.text,
            },
        });
        const tasks = await prisma_1.prisma.task.findMany({
            orderBy: { createdAt: "asc" },
            select: { id: true, title: true, status: true },
        });
        const recentMessages = await prisma_1.prisma.chatMessage.findMany({
            orderBy: { createdAt: "desc" },
            take: 6,
            select: { role: true, content: true },
        });
        const action = await (0, llm_1.interpretMessage)({
            userMessage: body.text,
            tasks,
            recentMessages: recentMessages.reverse().map((m) => ({
                role: m.role.toLowerCase(),
                content: m.content,
            })),
        });
        const result = await (0, taskExecutor_1.executeAction)({
            action,
            sourceMessageId: body.messageId,
        });
        const assistantMessageId = `${body.messageId}-assistant`;
        await prisma_1.prisma.chatMessage.create({
            data: {
                messageId: assistantMessageId,
                role: "ASSISTANT",
                content: result.summary,
            },
        });
        await prisma_1.prisma.processedMessage.create({
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
    }
    catch (error) {
        console.error(error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: "Invalid chat request payload.",
            });
        }
        return res.status(500).json({
            error: error instanceof Error
                ? error.message
                : "Failed to process message.",
        });
    }
});
exports.default = router;
//# sourceMappingURL=chat.js.map