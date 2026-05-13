import type { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types/auth";
import { assertOwnership } from "../utils/ownership";
import { rejectUnknownKeys, requireParam } from "../utils/request-validation";

interface ActivityInput {
  title?: unknown;
  dayOfWeek?: unknown;
  startTime?: unknown;
  endTime?: unknown;
}

interface ParsedActivity {
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const ALLOWED_KEYS = ["title", "dayOfWeek", "startTime", "endTime"] as const;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const parseAndValidateActivity = (
  body: ActivityInput,
): { ok: true; value: ParsedActivity } | { ok: false; error: string } => {
  const { title, dayOfWeek, startTime, endTime } = body ?? {};

  if (typeof title !== "string" || title.trim().length === 0) {
    return { ok: false, error: "title is required and must be a non-empty string" };
  }

  if (
    typeof dayOfWeek !== "number" ||
    !Number.isInteger(dayOfWeek) ||
    dayOfWeek < 0 ||
    dayOfWeek > 6
  ) {
    return {
      ok: false,
      error: "dayOfWeek is required and must be an integer between 0 (Sunday) and 6 (Saturday)",
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
      dayOfWeek,
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
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
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
    const owns = await ensurePeriodOwned(periodId, userId);
    if (!owns) {
      res.status(404).json({ error: "Period not found" });
      return;
    }

    const created = await prisma.recurringActivity.create({
      data: {
        userId,
        periodId,
        title: parsed.value.title,
        dayOfWeek: parsed.value.dayOfWeek,
        startTime: parsed.value.startTime,
        endTime: parsed.value.endTime,
      },
    });
    res.status(201).json(created);
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
    const owns = await ensurePeriodOwned(periodId, userId);
    if (!owns) {
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
      dayOfWeek: body.dayOfWeek !== undefined ? body.dayOfWeek : existing.dayOfWeek,
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
      dayOfWeek?: number;
      startTime?: string;
      endTime?: string;
    } = {};
    if (body.title !== undefined) data.title = parsed.value.title;
    if (body.dayOfWeek !== undefined) data.dayOfWeek = parsed.value.dayOfWeek;
    if (body.startTime !== undefined) data.startTime = parsed.value.startTime;
    if (body.endTime !== undefined) data.endTime = parsed.value.endTime;

    if (Object.keys(data).length === 0) {
      res.json(existing);
      return;
    }

    const updated = await prisma.recurringActivity.update({
      where: { id },
      data,
    });

    res.json(updated);
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

    const result = await prisma.recurringActivity.deleteMany({
      where: { id, userId, periodId },
    });

    if (result.count === 0) {
      res.status(404).json({ error: "Recurring activity not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete recurring activity:", error);
    res.status(500).json({ error: "Failed to delete recurring activity" });
  }
};
