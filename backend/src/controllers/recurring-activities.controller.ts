import type { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types/auth";
import { assertOwnership } from "../utils/ownership";
import { rejectUnknownKeys, requireParam } from "../utils/request-validation";
import {
  generateEventsForActivity,
  deleteEventsForActivity,
  updateEventsForActivity,
} from "../services/calendar-sync.service";

interface ActivityInput {
  title?: unknown;
  daysOfWeek?: unknown;
  startTime?: unknown;
  endTime?: unknown;
}

interface ParsedActivity {
  title: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
}

const ALLOWED_KEYS = ["title", "daysOfWeek", "startTime", "endTime"] as const;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const parseAndValidateActivity = (
  body: ActivityInput,
): { ok: true; value: ParsedActivity } | { ok: false; error: string } => {
  const { title, daysOfWeek, startTime, endTime } = body ?? {};

  if (typeof title !== "string" || title.trim().length === 0) {
    return { ok: false, error: "title is required and must be a non-empty string" };
  }

  if (
    !Array.isArray(daysOfWeek) ||
    daysOfWeek.length === 0 ||
    !daysOfWeek.every((d) => Number.isInteger(d) && d >= 0 && d <= 6)
  ) {
    return {
      ok: false,
      error: "daysOfWeek must be a non-empty array of integers 0-6 (0 = Sunday, 6 = Saturday)",
    };
  }

  // Reject duplicates.
  if (new Set(daysOfWeek).size !== daysOfWeek.length) {
    return {
      ok: false,
      error: "daysOfWeek must not contain duplicate values",
    };
  }

  if (typeof startTime !== "string" || !TIME_RE.test(startTime)) {
    return {
      ok: false,
      error: 'startTime is required and must match "HH:mm" 24h format (e.g. "07:30")',
    };
  }
  if (typeof endTime !== "string" || !TIME_RE.test(endTime)) {
    return {
      ok: false,
      error: 'endTime is required and must match "HH:mm" 24h format (e.g. "07:30")',
    };
  }

  if (endTime <= startTime) {
    return { ok: false, error: "endTime must be greater than startTime" };
  }

  return {
    ok: true,
    value: {
      title: title.trim(),
      daysOfWeek: daysOfWeek as number[],
      startTime,
      endTime,
    },
  };
};

const ensurePeriodOwned = async (
  periodId: string,
  userId: string,
): Promise<boolean> => {
  const period = await assertOwnership(prisma.period, periodId, userId);
  return period !== null;
};

export const getRecurringActivities = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const periodId = requireParam(req.params.periodId, "periodId");
  const userId = req.user!.id;

  try {
    const owns = await ensurePeriodOwned(periodId, userId);
    if (!owns) {
      res.status(404).json({ error: "Period not found" });
      return;
    }

    const activities = await prisma.recurringActivity.findMany({
      where: { userId, periodId },
      orderBy: [{ startTime: "asc" }],
    });
    res.json(activities);
  } catch (error) {
    console.error("Failed to retrieve recurring activities:", error);
    res.status(500).json({ error: "Failed to retrieve recurring activities" });
  }
};

export const getRecurringActivityById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const periodId = requireParam(req.params.periodId, "periodId");
  const id = requireParam(req.params.id, "id");
  const userId = req.user!.id;

  try {
    const owns = await ensurePeriodOwned(periodId, userId);
    if (!owns) {
      res.status(404).json({ error: "Period not found" });
      return;
    }

    const activity = await prisma.recurringActivity.findFirst({
      where: { id, userId, periodId },
    });

    if (!activity) {
      res.status(404).json({ error: "Recurring activity not found" });
      return;
    }

    res.json(activity);
  } catch (error) {
    console.error("Failed to retrieve recurring activity:", error);
    res.status(500).json({ error: "Failed to retrieve recurring activity" });
  }
};

export const createRecurringActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const periodId = requireParam(req.params.periodId, "periodId");
  const userId = req.user!.id;
  const body = (req.body ?? {}) as Record<string, unknown>;

  const unknown = rejectUnknownKeys(body, ALLOWED_KEYS);
  if (unknown.length > 0) {
    res.status(400).json({
      error: `Unknown fields: ${unknown.join(", ")}. Allowed: ${ALLOWED_KEYS.join(", ")}`,
    });
    return;
  }

  const parsed = parseAndValidateActivity(body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  try {
    const period = await assertOwnership(prisma.period, periodId, userId);
    if (!period) {
      res.status(404).json({ error: "Period not found" });
      return;
    }

    const created = await prisma.recurringActivity.create({
      data: {
        userId,
        periodId,
        title: parsed.value.title,
        daysOfWeek: parsed.value.daysOfWeek,
        startTime: parsed.value.startTime,
        endTime: parsed.value.endTime,
      },
    });

    // Best-effort Google Calendar sync — never rolls back the DB row.
    const sync = await generateEventsForActivity(userId, created, period);

    res.status(201).json({ ...created, sync });
  } catch (error) {
    console.error("Failed to create recurring activity:", error);
    res.status(500).json({ error: "Failed to create recurring activity" });
  }
};

export const updateRecurringActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const periodId = requireParam(req.params.periodId, "periodId");
  const id = requireParam(req.params.id, "id");
  const userId = req.user!.id;
  const body = (req.body ?? {}) as Record<string, unknown>;

  const unknown = rejectUnknownKeys(body, ALLOWED_KEYS);
  if (unknown.length > 0) {
    res.status(400).json({
      error: `Unknown fields: ${unknown.join(", ")}. Allowed: ${ALLOWED_KEYS.join(", ")}`,
    });
    return;
  }

  try {
    const period = await assertOwnership(prisma.period, periodId, userId);
    if (!period) {
      res.status(404).json({ error: "Period not found" });
      return;
    }

    const existing = await prisma.recurringActivity.findFirst({
      where: { id, userId, periodId },
    });

    if (!existing) {
      res.status(404).json({ error: "Recurring activity not found" });
      return;
    }

    // Build merged candidate for VALIDATION only.
    const candidate: ActivityInput = {
      title: body.title !== undefined ? body.title : existing.title,
      daysOfWeek: body.daysOfWeek !== undefined ? body.daysOfWeek : existing.daysOfWeek,
      startTime: body.startTime !== undefined ? body.startTime : existing.startTime,
      endTime: body.endTime !== undefined ? body.endTime : existing.endTime,
    };

    const parsed = parseAndValidateActivity(candidate);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    // WRITE only fields the client actually sent.
    const data: {
      title?: string;
      daysOfWeek?: number[];
      startTime?: string;
      endTime?: string;
    } = {};
    if (body.title !== undefined) data.title = parsed.value.title;
    if (body.daysOfWeek !== undefined) data.daysOfWeek = parsed.value.daysOfWeek;
    if (body.startTime !== undefined) data.startTime = parsed.value.startTime;
    if (body.endTime !== undefined) data.endTime = parsed.value.endTime;

    if (Object.keys(data).length === 0) {
      res.json({ ...existing, sync: { updated: 0, deleted: 0, created: 0, errors: [] } });
      return;
    }

    const updated = await prisma.recurringActivity.update({
      where: { id },
      data,
    });

    // Best-effort Google Calendar sync.
    const sync = await updateEventsForActivity(userId, existing, updated, period);

    res.json({ ...updated, sync });
  } catch (error) {
    console.error("Failed to update recurring activity:", error);
    res.status(500).json({ error: "Failed to update recurring activity" });
  }
};

export const deleteRecurringActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const periodId = requireParam(req.params.periodId, "periodId");
  const id = requireParam(req.params.id, "id");
  const userId = req.user!.id;

  try {
    const owns = await ensurePeriodOwned(periodId, userId);
    if (!owns) {
      res.status(404).json({ error: "Period not found" });
      return;
    }

    // Verify activity exists and is owned before doing anything.
    const existing = await prisma.recurringActivity.findFirst({
      where: { id, userId, periodId },
    });

    if (!existing) {
      res.status(404).json({ error: "Recurring activity not found" });
      return;
    }

    // Delete Google Calendar events BEFORE the DB row (Cascade can't reach Google).
    const sync = await deleteEventsForActivity(userId, id);

    // Always proceed with DB delete regardless of Google API outcome.
    await prisma.recurringActivity.deleteMany({
      where: { id, userId, periodId },
    });

    if (sync.errors.length > 0) {
      // Partial Google failure — surface errors but confirm DB row is gone.
      res.status(200).json({ id, sync: { deleted: sync.deleted, errors: sync.errors } });
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error("Failed to delete recurring activity:", error);
    res.status(500).json({ error: "Failed to delete recurring activity" });
  }
};
