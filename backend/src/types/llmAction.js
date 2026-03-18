"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmActionSchema = void 0;
const zod_1 = require("zod");
exports.LlmActionSchema = zod_1.z.object({
    intent: zod_1.z.enum([
        "create_tasks",
        "complete_tasks",
        "attach_detail",
        "clarify",
        "none",
    ]),
    tasksToCreate: zod_1.z
        .array(zod_1.z.object({
        title: zod_1.z.string().min(1),
    }))
        .default([]),
    tasksToComplete: zod_1.z
        .array(zod_1.z.object({
        taskId: zod_1.z.string().min(1),
    }))
        .default([]),
    detailsToAttach: zod_1.z
        .array(zod_1.z.object({
        taskId: zod_1.z.string().min(1),
        content: zod_1.z.string().min(1),
    }))
        .default([]),
    clarificationQuestion: zod_1.z.string().nullable().default(null),
});
//# sourceMappingURL=llmAction.js.map