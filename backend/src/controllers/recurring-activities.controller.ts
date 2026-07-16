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

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

type ScheduleEntry = { dayOfWeek: number; startTime: string; endTime: string };

interface ActivityInput {
  title?: unknown;
  schedule?: unknown;
}

interface ParsedActivity {
  title: string;
  schedule: ScheduleEntry[];
}

const ALLOWED_KEYS = ["title", "schedule"] as const;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// -------------------------------------------------------------------
// Validation helper
// -------------------------------------------------------------------

export const parseAndValidateActivity = (
  body: ActivityInput,
): { ok: true; value: ParsedActivity } | { ok: false; error: string } => {
  const { title, schedule } = body ?? {};

  if (typeof title !== "string" || title.trim().length === 0) {
    return { ok: false, error: "title is required and must be a non-empty string" };
  }

  if (!Array.isArray(schedule) || schedule.length === 0) {
    return {
      ok: false,
      error: "schedule is required and must be a non-empty array of schedule entries",
    };
  }

  // Validate each entry in the schedule array.
  for (let i = 0; i < schedule.length; i++) {
    const entry = schedule[i];
    if (typeof entry !== "object" || entry === null) {
      return { ok: false, error: `schedule[${i}] must be an object` };
    }

    const { dayOfWeek, startTime, endTime } = entry as Record<string, unknown>;

    if (!Number.isInteger(dayOfWeek) || (dayOfWeek as number) < 0 || (dayOfWeek as number) > 6) {
      return {
        ok: false,
        error: `schedule[${i}].dayOfWeek must be an integer between 0 (Sunday) and 6 (Saturday)`,
      };
    }

    if (typeof startTime !== "string" || !TIME_RE.test(startTime)) {
      return {
        ok: false,
        error: `schedule[${i}].startTime must match "HH:MM" 24h format (e.g. "07:30")`,
      };
    }

    if (typeof endTime !== "string" || !TIME_RE.test(endTime)) {
      return {
        ok: false,
        error: `schedule[${i}].endTime must match "HH:MM" 24h format (e.g. "18:00")`,
      };
    }

    if (endTime <= startTime) {
      return {
        ok: false,
        error: `schedule[${i}].endTime must be greater than startTime`,
      };
    }
  }

  // Reject duplicate dayOfWeek values.
  const days = (schedule as Array<{ dayOfWeek: number }>).map((e) => e.dayOfWeek);
  if (new Set(days).size !== days.length) {
    return {
      ok: false,
      error: "schedule must not contain duplicate dayOfWeek values",
    };
  }

  return {
    ok: true,
    value: {
      title: title.trim(),
      schedule: (schedule as Array<{ dayOfWeek: unknown; startTime: unknown; endTime: unknown }>).map(
        (e) => ({
          dayOfWeek: e.dayOfWeek as number,
          startTime: e.startTime as string,
          endTime: e.endTime as string,
        }),
      ),
    },
  };
};

// -------------------------------------------------------------------
// Shared helpers
// -------------------------------------------------------------------

const ensurePeriodOwned = async (
  periodId: string,
  userId: string,
): Promise<boolean> => {
  const period = await assertOwnership(prisma.period, periodId, userId);
  return period !== null;
};

// -------------------------------------------------------------------
// Handlers
// -------------------------------------------------------------------

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
      orderBy: [{ createdAt: "asc" }],
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
        schedule: parsed.value.schedule,
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

    // Build merged candidate for VALIDATION only — falls back to existing values.
    const candidate: ActivityInput = {
      title: body.title !== undefined ? body.title : existing.title,
      schedule: body.schedule !== undefined ? body.schedule : existing.schedule,
    };

    const parsed = parseAndValidateActivity(candidate);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    // WRITE only fields the client actually sent.
    const data: { title?: string; schedule?: ScheduleEntry[] } = {};
    if (body.title !== undefined) data.title = parsed.value.title;
    if (body.schedule !== undefined) data.schedule = parsed.value.schedule;

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
