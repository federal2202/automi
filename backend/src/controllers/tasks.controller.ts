import type { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types/auth";

export const getTasks = async (req: AuthRequest, res: Response) => {
    try {
        const tasks = await prisma.task.findMany({
            where: {
                userId: req.user!.id
            }
        })
        res.json(tasks)
    } catch (error) {
        console.error("Failed to retrieve tasks:", error)
        res.status(500).json({ error: "Failed to retrieve tasks" })
    }
}

