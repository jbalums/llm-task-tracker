import { prisma } from "../prisma.js";
import { normalizeText } from "../utils/normalize.js";
import type { LlmAction } from "../types/llmAction.js";

export async function executeAction(params: {
	action: LlmAction;
	sourceMessageId: string;
}) {
	const { action, sourceMessageId } = params;

	if (action.intent === "clarify") {
		return {
			summary:
				action.clarificationQuestion ||
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

	const createdTitles: string[] = [];
	const completedTitles: string[] = [];
	const attachedDetails: string[] = [];

	if (action.tasksToCreate.length > 0) {
		for (const item of action.tasksToCreate) {
			const normalizedTitle = normalizeText(item.title);

			const existing = await prisma.task.findFirst({
				where: {
					normalizedTitle,
				},
			});

			if (!existing) {
				const task = await prisma.task.create({
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
			const existing = await prisma.task.findUnique({
				where: { id: item.taskId },
			});

			if (existing && existing.status !== "COMPLETED") {
				await prisma.task.update({
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
			const task = await prisma.task.findUnique({
				where: { id: item.taskId },
			});

			if (!task) continue;

			const duplicate = await prisma.taskDetail.findFirst({
				where: {
					taskId: item.taskId,
					content: item.content.trim(),
					sourceMessageId,
				},
			});

			if (!duplicate) {
				await prisma.taskDetail.create({
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

	const parts: string[] = [];

	if (createdTitles.length) {
		parts.push(
			`Created ${createdTitles.length} task(s): ${createdTitles.join(", ")}`,
		);
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
