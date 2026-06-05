import { Response } from "express";

// Map of userId → list of open SSE connections
const clients = new Map<string, Response[]>();

export function addClient(userId: string, res: Response): void {
  const existing = clients.get(userId) ?? [];
  clients.set(userId, [...existing, res]);
}

export function removeClient(userId: string, res: Response): void {
  const existing = clients.get(userId) ?? [];
  clients.set(userId, existing.filter((r) => r !== res));
}

export function notifyUser(userId: string, data: object): void {
  const userClients = clients.get(userId) ?? [];
  for (const res of userClients) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}
