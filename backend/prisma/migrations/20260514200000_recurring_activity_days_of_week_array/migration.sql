BEGIN;

-- Add the new array column with a safe default so all existing rows get an empty array first.
ALTER TABLE "recurring_activities" ADD COLUMN "daysOfWeek" integer[] NOT NULL DEFAULT '{}';

-- Migrate every existing row: wrap the single integer into a one-element array.
UPDATE "recurring_activities" SET "daysOfWeek" = ARRAY["dayOfWeek"];

-- Drop the old scalar column.
ALTER TABLE "recurring_activities" DROP COLUMN "dayOfWeek";

-- Remove the old B-tree index on (periodId, dayOfWeek).
DROP INDEX IF EXISTS "recurring_activities_periodId_dayOfWeek_idx";

-- Create a GIN index for efficient array-containment queries on daysOfWeek.
-- Note: Prisma DSL cannot express GIN indexes; this index is managed manually.
CREATE INDEX "recurring_activities_periodId_daysOfWeek_idx"
  ON "recurring_activities" USING GIN ("daysOfWeek");

COMMIT;
