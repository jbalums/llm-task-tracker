import { z } from "zod";
export declare const LlmActionSchema: z.ZodObject<{
    intent: z.ZodEnum<{
        create_tasks: "create_tasks";
        complete_tasks: "complete_tasks";
        attach_detail: "attach_detail";
        clarify: "clarify";
        none: "none";
    }>;
    tasksToCreate: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
    }, z.core.$strip>>>;
    tasksToComplete: z.ZodDefault<z.ZodArray<z.ZodObject<{
        taskId: z.ZodString;
    }, z.core.$strip>>>;
    detailsToAttach: z.ZodDefault<z.ZodArray<z.ZodObject<{
        taskId: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>>>;
    clarificationQuestion: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type LlmAction = z.infer<typeof LlmActionSchema>;
//# sourceMappingURL=llmAction.d.ts.map