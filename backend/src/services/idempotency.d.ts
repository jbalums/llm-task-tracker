export declare function findProcessedMessage(messageId: string): Promise<{
    id: string;
    messageId: string;
    rawContent: string;
    normalizedHash: string;
    responseSummary: string;
    actionType: string;
    createdAt: Date;
} | null>;
//# sourceMappingURL=idempotency.d.ts.map