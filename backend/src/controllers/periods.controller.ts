import type { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types/auth";
import { assertOwnership } from "../utils/ownership";
import { rejectUnknownKeys, requireParam } from "../utils/request-validation";
import {
  deleteEventsForPeriod,
  syncPeriodDateRange,
} from "../services/calendar-sync.service";

interface PeriodInput {
  title?: unknown;
  startDate?: unknown;
  endDate?: unknown;
}

interface ParsedPeriod {
  title: string;
  startDate: Date;
  endDate: Date;
}

const ALLOWED_KEYS = ["title", "startDate", "endDate"] as const;

export const parseAndValidatePeriod = (
  body: PeriodInput,
): { ok: true; value: ParsedPeriod } | { ok: false; error: string } => {
  const { title, startDate, endDate } = body ?? {};

  if (typeof title !== "string" || title.trim().length === 0) {
    return { ok: false, error: "title is required and must be a non-empty string" };
  }

  if (typeof startDate !== "string") {
    return { ok: false, error: "startDate is required and must be an ISO 8601 string" };
  }
  if (typeof endDate !== "string") {
    return { ok: false, error: "endDate is required and must be an ISO 8601 string" };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime())) {
    return { ok: false, error: "startDate must be a valid ISO 8601 date string" };
  }
  if (Number.isNaN(end.getTime())) {
    return { ok: false, error: "endDate must be a valid ISO 8601 date string" };
  }
  if (end.getTime() < start.getTime()) {
    return { ok: false, error: "endDate must be greater than or equal to startDate" };
  }

  return {
    ok: true,
    value: { title: title.trim(), startDate: start, endDate: end },
  };
};

export const getPeriods = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const periods = await prisma.period.findMany({
      where: { userId: req.user!.id },
      orderBy: { startDate: "desc" },
    });
    res.json(periods);
  } catch (error) {
    console.error("Failed to retrieve periods:", error);
    res.status(500).json({ error: "Failed to retrieve periods" });
  }
};

export const getPeriodById = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = requireParam(req.params.id, "id");

  try {
    const period = await assertOwnership(prisma.period, id, req.user!.id);

    if (!period) {
      res.status(404).json({ error: "Period not found" });
      return;
    }

    res.json(period);
  } catch (error) {
    console.error("Failed to retrieve period:", error);
    res.status(500).json({ error: "Failed to retrieve period" });
  }
};

export const createPeriod = async (req: AuthRequest, res: Response): Promise<void> => {
  const body = (req.body ?? {}) as Record<string, unknown>;

  const unknown = rejectUnknownKeys(body, ALLOWED_KEYS);
  if (unknown.length > 0) {
    res.status(400).json({
      error: `Unknown fields: ${unknown.join(", ")}. Allowed: ${ALLOWED_KEYS.join(", ")}`,
    });
    return;
  }

  const parsed = parseAndValidatePeriod(body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  try {
    const created = await prisma.period.create({
      data: {
        userId: req.user!.id,
        title: parsed.value.title,
        startDate: parsed.value.startDate,
        endDate: parsed.value.endDate,
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error("Failed to create period:", error);
    res.status(500).json({ error: "Failed to create period" });
  }
};

export const updatePeriod = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = requireParam(req.params.id, "id");
  const body = (req.body ?? {}) as Record<string, unknown>;

  const unknown = rejectUnknownKeys(body, ALLOWED_KEYS);
  if (unknown.length > 0) {
    res.status(400).json({
      error: `Unknown fields: ${unknown.join(", ")}. Allowed: ${ALLOWED_KEYS.join(", ")}`,
    });
    return;
  }

  try {
    // Fetch once for ownership + to validate the merged shape coherently
    // (so endDate >= startDate is checked against current row when only one side is patched).
    const existing = await assertOwnership(prisma.period, id, req.user!.id);

    if (!existing) {
      res.status(404).json({ error: "Period not found" });
      return;
    }

    // Build a merged candidate for VALIDATION only.
    const candidate: PeriodInput = {
      title: body.title !== undefined ? body.title : existing.title,
      startDate:
        body.startDate !== undefined
          ? body.startDate
          : existing.startDate.toISOString(),
      endDate:
        body.endDate !== undefined ? body.endDate : existing.endDate.toISOString(),
    };

    const parsed = parseAndValidatePeriod(candidate);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    // WRITE only the fields the client actually sent.
    const data: { title?: string; startDate?: Date; endDate?: Date } = {};
    if (body.title !== undefined) data.title = parsed.value.title;
    if (body.startDate !== undefined) data.startDate = parsed.value.startDate;
    if (body.endDate !== undefined) data.endDate = parsed.value.endDate;

    if (Object.keys(data).length === 0) {
      // Nothing to update — return the existing row unchanged.
      res.json(existing);
      return;
    }

    const updated = await prisma.period.update({
      where: { id },
      data,
    });

    // If date range changed, sync Calendar events for all activities in the period.
    const dateRangeChanged =
      body.startDate !== undefined || body.endDate !== undefined;
    if (dateRangeChanged) {
      // Fire-and-forget — do not await so date-range errors don't fail the HTTP response.
      // Errors are logged server-side only (best-effort, same as activity sync).
      syncPeriodDateRange(
        req.user!.id,
        updated,
        existing.startDate,
        existing.endDate,
      ).catch((err) => {
        console.error("syncPeriodDateRange failed:", err);
      });
    }

    res.json(updated);
  } catch (error) {
    console.error("Failed to update period:", error);
    res.status(500).json({ error: "Failed to update period" });
  }
};

export const deletePeriod = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = requireParam(req.params.id, "id");
  const userId = req.user!.id;

  try {
    // Verify ownership before touching Google Calendar.
    const existing = await assertOwnership(prisma.period, id, userId);
    if (!existing) {
      res.status(404).json({ error: "Period not found" });
      return;
    }

    // Delete Google Calendar events for all activities in the period
    // BEFORE the DB delete (Cascade can't reach Google).
    await deleteEventsForPeriod(userId, id);

    // Single-round-trip DB delete.
    const result = await prisma.period.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      res.status(404).json({ error: "Period not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete period:", error);
    res.status(500).json({ error: "Failed to delete period" });
  }
};
