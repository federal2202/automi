import type { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types/auth";

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tasks = await prisma.task.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: "desc" },
        });
        res.json(tasks);
    } catch (error) {
        console.error("Failed to retrieve tasks:", error);
        res.status(500).json({ error: "Failed to retrieve tasks" });
    }
};

export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;

    try {
        const task = await prisma.task.findFirst({
            where: { id, userId: req.user!.id },
        });

        if (!task) {
            res.status(404).json({ error: "Task not found" });
            return;
        }

        res.json(task);
    } catch (error) {
        console.error("Failed to retrieve task:", error);
        res.status(500).json({ error: "Failed to retrieve task" });
    }
};

export const toggleTaskDone = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;

    try {
        const existing = await prisma.task.findFirst({
            where: { id, userId: req.user!.id },
        });

        if (!existing) {
            res.status(404).json({ error: "Task not found" });
            return;
        }

        const isDone =
            typeof req.body?.isDone === "boolean" ? req.body.isDone : !existing.isDone;

        const updated = await prisma.task.update({
            where: { id },
            data: { isDone },
        });

        res.json(updated);
    } catch (error) {
        console.error("Failed to toggle task done state:", error);
        res.status(500).json({ error: "Failed to update task" });
    }
};
