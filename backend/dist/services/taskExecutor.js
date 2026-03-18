"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeAction = executeAction;
const prisma_1 = require("../prisma");
const normalize_1 = require("../utils/normalize");
async function executeAction(params) {
    const { action, sourceMessageId } = params;
    if (action.intent === "clarify") {
        return {
            summary: action.clarificationQuestion ||
                "Can you clarify which task you mean?",
            actionType: "clarify",
        };
    }
    if (action.intent === "none") {
        return {
            summary: "No task changes were made.",
            actionType: "none",
        };
    }
    const createdTitles = [];
    const completedTitles = [];
    const attachedDetails = [];
    if (action.tasksToCreate.length > 0) {
        for (const item of action.tasksToCreate) {
            const normalizedTitle = (0, normalize_1.normalizeText)(item.title);
            const existing = await prisma_1.prisma.task.findFirst({
                where: {
                    normalizedTitle,
                },
            });
            if (!existing) {
                const task = await prisma_1.prisma.task.create({
                    data: {
                        title: item.title.trim(),
                        normalizedTitle,
                        sourceMessageId,
                    },
                });
                createdTitles.push(task.title);
            }
        }
    }
    if (action.tasksToComplete.length > 0) {
        for (const item of action.tasksToComplete) {
            const existing = await prisma_1.prisma.task.findUnique({
                where: { id: item.taskId },
            });
            if (existing && existing.status !== "COMPLETED") {
                await prisma_1.prisma.task.update({
                    where: { id: item.taskId },
                    data: {
                        status: "COMPLETED",
                        completedAt: new Date(),
                    },
                });
                completedTitles.push(existing.title);
            }
        }
    }
    if (action.detailsToAttach.length > 0) {
        for (const item of action.detailsToAttach) {
            const task = await prisma_1.prisma.task.findUnique({
                where: { id: item.taskId },
            });
            if (!task)
                continue;
            const duplicate = await prisma_1.prisma.taskDetail.findFirst({
                where: {
                    taskId: item.taskId,
                    content: item.content.trim(),
                    sourceMessageId,
                },
            });
            if (!duplicate) {
                await prisma_1.prisma.taskDetail.create({
                    data: {
                        taskId: item.taskId,
                        content: item.content.trim(),
                        sourceMessageId,
                    },
                });
                attachedDetails.push(task.title);
            }
        }
    }
    const parts = [];
    if (createdTitles.length) {
        parts.push(`Created ${createdTitles.length} task(s): ${createdTitles.join(", ")}`);
    }
    if (completedTitles.length) {
        parts.push(`Completed: ${completedTitles.join(", ")}`);
    }
    if (attachedDetails.length) {
        parts.push(`Added detail to: ${attachedDetails.join(", ")}`);
    }
    return {
        summary: parts.length ? parts.join(". ") : "No changes were needed.",
        actionType: action.intent,
    };
}
