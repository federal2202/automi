import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { addClient, removeClient } from "../services/sse.service";

const router: Router = Router();

const HEARTBEAT_MS = 15_000;

router.get("/", async (req: Request, res: Response) => {
  // Read the httpOnly accessToken cookie (EventSource is opened with
  // withCredentials, so the browser sends it). The token no longer travels in
  // the URL query, so it can't leak into access logs (morgan) or proxies.
  const token = req.cookies?.accessToken as string | undefined;

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

    // Heartbeat: reverse proxies (Caddy/nginx) close idle connections after
    // ~30-60s. A comment line (":" prefix) every 15s keeps the stream open
    // without emitting a real event the client would act on.
    const heartbeat = setInterval(() => {
      res.write(`: ping\n\n`);
    }, HEARTBEAT_MS);

    req.on("close", () => {
      clearInterval(heartbeat);
      removeClient(user.id, res);
    });
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
});

export default router;
