import type { LlmAction } from "../types/llmAction";
export declare function executeAction(params: {
    action: LlmAction;
    sourceMessageId: string;
}): Promise<{
    summary: string;
    actionType: string;
}>;
//# sourceMappingURL=taskExecutor.d.ts.map