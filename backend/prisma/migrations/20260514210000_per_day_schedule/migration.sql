BEGIN;

-- Add the new schedule column with a safe default so all existing rows are valid.
ALTER TABLE "recurring_activities" ADD COLUMN "schedule" jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Migrate existing rows: build a schedule array from the old daysOfWeek array +
-- shared startTime/endTime (all days got the same time window before this change).
UPDATE "recurring_activities"
SET "schedule" = COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'dayOfWeek', d,
        'startTime', "startTime",
        'endTime',   "endTime"
      )
    )
    FROM unnest("daysOfWeek") AS d
  ),
  '[]'::jsonb
);

-- Drop the GIN index on daysOfWeek (managed manually, not in Prisma DSL).
DROP INDEX IF EXISTS "recurring_activities_periodId_daysOfWeek_idx";

-- Drop the three columns being replaced.
ALTER TABLE "recurring_activities" DROP COLUMN "daysOfWeek";
ALTER TABLE "recurring_activities" DROP COLUMN "startTime";
ALTER TABLE "recurring_activities" DROP COLUMN "endTime";

COMMIT;
