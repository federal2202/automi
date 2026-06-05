import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { addClient, removeClient } from "../services/sse.service";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
  const token = req.query.token as string;

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    addClient(user.id, res);

    req.on("close", () => {
      removeClient(user.id, res);
    });
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
});

export default router;
