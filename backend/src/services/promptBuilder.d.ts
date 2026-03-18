export declare function buildPrompt(params: {
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
}): string;
//# sourceMappingURL=promptBuilder.d.ts.map