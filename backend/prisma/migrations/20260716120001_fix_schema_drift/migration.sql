-- Fixes migration-history drift found by replaying all migrations from
-- scratch against an empty database (a fresh clone previously could not
-- migrate to a working schema at all):
--
-- 1. `tasks.aiStatus` — declared in schema.prisma since the very first Kafka
--    AI-enrichment work (it's central to the whole task pipeline: BUG-3/BUG-9
--    in the bug audit are both about this column) but never actually created
--    by any migration. It only exists on the current Supabase database
--    because it was added there directly (`prisma db push` or a manual
--    ALTER) instead of through `prisma migrate dev`. A database built purely
--    from this migrations folder was missing it entirely, so every task
--    query would fail immediately after a fresh deploy.
-- 2. `recurring_activities.schedule` — created WITH a default in
--    20260514210000_per_day_schedule but schema.prisma declares no default;
--    harmless in practice (Prisma always sets it explicitly) but dropped
--    here so the schema and a fresh database agree exactly.
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "aiStatus" TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE "recurring_activities" ALTER COLUMN "schedule" DROP DEFAULT;
