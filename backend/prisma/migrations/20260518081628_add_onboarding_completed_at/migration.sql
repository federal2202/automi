-- Add onboardingCompletedAt to users.
-- Nullable with no default — existing rows stay NULL intentionally (no backfill).
ALTER TABLE "users" ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);
