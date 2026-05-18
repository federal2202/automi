import type { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types/auth";
import { rejectUnknownKeys } from "../utils/request-validation";

const ALLOWED_KEYS = ["timezone"] as const;
const NO_KEYS: readonly string[] = [];

// Intl.supportedValuesOf was added in ES2021; cast to access it while tsconfig
// targets ES2020 (adding it to the lib would affect the whole project).
const VALID_TIMEZONES = new Set<string>(
  (Intl as unknown as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf("timeZone"),
);

export const completeOnboarding = async (req: AuthRequest, res: Response): Promise<void> => {
  const body = (req.body ?? {}) as Record<string, unknown>;

  const unknown = rejectUnknownKeys(body, NO_KEYS);
  if (unknown.length > 0) {
    res.status(400).json({
      error: `Unknown fields: ${unknown.join(", ")}. No fields are allowed in the request body.`,
    });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, onboardingCompletedAt: true },
    });

    if (!existing) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    // Idempotent: do not overwrite if already set
    if (existing.onboardingCompletedAt !== null) {
      res.json({
        id: existing.id,
        email: existing.email,
        name: existing.name,
        onboardingCompletedAt: existing.onboardingCompletedAt.toISOString(),
      });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { onboardingCompletedAt: new Date() },
      select: { id: true, email: true, name: true, onboardingCompletedAt: true },
    });

    res.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      onboardingCompletedAt: updated.onboardingCompletedAt!.toISOString(),
    });
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    res.status(500).json({ error: "Failed to complete onboarding" });
  }
};

export const updateTimezone = async (req: AuthRequest, res: Response): Promise<void> => {
  const body = (req.body ?? {}) as Record<string, unknown>;

  const unknown = rejectUnknownKeys(body, ALLOWED_KEYS);
  if (unknown.length > 0) {
    res.status(400).json({
      error: `Unknown fields: ${unknown.join(", ")}. Allowed: ${ALLOWED_KEYS.join(", ")}`,
    });
    return;
  }

  const { timezone } = body;

  if (typeof timezone !== "string" || timezone.trim().length === 0) {
    res.status(400).json({ error: "timezone is required and must be a non-empty string" });
    return;
  }

  if (!VALID_TIMEZONES.has(timezone)) {
    res.status(400).json({
      error: `Unknown timezone: "${timezone}". Must be a valid IANA timezone identifier (e.g. "America/New_York", "Europe/London").`,
    });
    return;
  }

  try {
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { timezone },
      select: { id: true, email: true, name: true, timezone: true },
    });

    res.json(updated);
  } catch (error) {
    console.error("Failed to update timezone:", error);
    res.status(500).json({ error: "Failed to update timezone" });
  }
};
