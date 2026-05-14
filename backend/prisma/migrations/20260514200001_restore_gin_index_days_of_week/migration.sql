-- Restore the GIN index on daysOfWeek.
-- Prisma cannot express GIN indexes in its DSL, so it dropped the one created
-- in migration 20260514200000. This migration re-adds it manually.
-- The index is also marked with "/// managed manually: GIN(daysOfWeek)" in schema.prisma.
CREATE INDEX IF NOT EXISTS "recurring_activities_periodId_daysOfWeek_idx"
  ON "recurring_activities" USING GIN ("daysOfWeek");
