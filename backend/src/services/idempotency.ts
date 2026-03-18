import { prisma } from "../prisma";

export async function findProcessedMessage(messageId: string) {
	return prisma.processedMessage.findUnique({
		where: { messageId },
	});
}
