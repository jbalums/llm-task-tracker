import { prisma } from "../prisma.js";

export async function findProcessedMessage(messageId: string) {
	return prisma.processedMessage.findUnique({
		where: { messageId },
	});
}
