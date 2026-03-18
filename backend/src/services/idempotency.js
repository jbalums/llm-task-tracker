"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProcessedMessage = findProcessedMessage;
const prisma_1 = require("../prisma");
async function findProcessedMessage(messageId) {
    return prisma_1.prisma.processedMessage.findUnique({
        where: { messageId },
    });
}
//# sourceMappingURL=idempotency.js.map