-- This migration predates 20260514200000, which is the one that actually
-- CREATEs the "daysOfWeek" column and its GIN index. On a database replayed
-- from scratch (fresh clone, CI, a new environment), neither object exists
-- yet at this point in history, so the original unguarded DROP
-- INDEX/ALTER COLUMN here fails outright — this was only "safe" against an
-- already-drifted dev database that had them from earlier manual `db push`
-- experimentation. Guarded so this migration is a correct no-op on a fresh
-- database and preserves its original effect wherever the objects already
-- exist (i.e. environments — including the current Supabase instance — that
-- had already applied it).
--
-- NOTE: editing this file changes its checksum. If you deploy to an
-- environment where this migration is already recorded as applied (e.g. the
-- existing Supabase database), `prisma migrate deploy` will report it as
-- "modified after it was applied" and refuse to continue. Run once, before
-- the next deploy there:
--   npx prisma migrate resolve --applied 20260514142532_recurring_activity_days_of_week_array

-- DropIndex
DROP INDEX IF EXISTS "recurring_activities_periodId_daysOfWeek_idx";

-- AlterTable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recurring_activities' AND column_name = 'daysOfWeek'
  ) THEN
    ALTER TABLE "recurring_activities" ALTER COLUMN "daysOfWeek" DROP DEFAULT;
  END IF;
END $$;
