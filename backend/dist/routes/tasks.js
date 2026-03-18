"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
router.get("/", async (_req, res) => {
    const tasks = await prisma_1.prisma.task.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            details: {
                orderBy: { createdAt: "asc" },
            },
        },
    });
    res.json(tasks);
});
router.get("/:id", async (req, res) => {
    const task = await prisma_1.prisma.task.findUnique({
        where: { id: req.params.id },
        include: {
            details: {
                orderBy: { createdAt: "asc" },
            },
        },
    });
    if (!task) {
        return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
});
exports.default = router;
