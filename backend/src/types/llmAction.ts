import { z } from "zod";

export const LlmActionSchema = z.object({
	intent: z.enum([
		"create_tasks",
		"complete_tasks",
		"attach_detail",
		"clarify",
		"none",
	]),
	tasksToCreate: z
		.array(
			z.object({
				title: z.string().min(1),
			}),
		)
		.default([]),
	tasksToComplete: z
		.array(
			z.object({
				taskId: z.string().min(1),
			}),
		)
		.default([]),
	detailsToAttach: z
		.array(
			z.object({
				taskId: z.string().min(1),
				content: z.string().min(1),
			}),
		)
		.default([]),
	clarificationQuestion: z.string().nullable().default(null),
});

export type LlmAction = z.infer<typeof LlmActionSchema>;
