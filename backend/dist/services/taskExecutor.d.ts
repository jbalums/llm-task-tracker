import type { LlmAction } from "../types/llmAction";
export declare function executeAction(params: {
    action: LlmAction;
    sourceMessageId: string;
}): Promise<{
    summary: any;
    actionType: string;
} | {
    summary: string;
    actionType: any;
}>;
//# sourceMappingURL=taskExecutor.d.ts.map