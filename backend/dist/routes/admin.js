"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
router.post("/reset", async (_req, res) => {
    await prisma_1.prisma.taskDetail.deleteMany();
    await prisma_1.prisma.task.deleteMany();
    await prisma_1.prisma.chatMessage.deleteMany();
    await prisma_1.prisma.processedMessage.deleteMany();
    res.json({ ok: true });
});
exports.default = router;
