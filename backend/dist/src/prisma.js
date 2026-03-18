"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("./env");
const client_1 = require("../generated/prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const env_1 = require("./env");
const adapter = new adapter_pg_1.PrismaPg({
    connectionString: (0, env_1.getRequiredEnv)("DATABASE_URL"),
});
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        adapter,
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
//# sourceMappingURL=prisma.js.map