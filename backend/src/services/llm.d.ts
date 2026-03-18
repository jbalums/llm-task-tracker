export declare function interpretMessage(params: {
    userMessage: string;
    tasks: Array<{
        id: string;
        title: string;
        status: string;
    }>;
    recentMessages: Array<{
        role: string;
        content: string;
    }>;
}): Promise<{
    intent: "create_tasks" | "complete_tasks" | "attach_detail" | "clarify" | "none";
    tasksToCreate: {
        title: string;
    }[];
    tasksToComplete: {
        taskId: string;
    }[];
    detailsToAttach: {
        taskId: string;
        content: string;
    }[];
    clarificationQuestion: string | null;
}>;
//# sourceMappingURL=llm.d.ts.map