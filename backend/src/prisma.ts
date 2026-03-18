// @ts-nocheck
import "./env.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { getRequiredEnv } from "./env.js";

const adapter = new PrismaPg({
	connectionString: getRequiredEnv("DATABASE_URL"),
});

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient;
};

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
