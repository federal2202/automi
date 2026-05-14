-- DropIndex
DROP INDEX "recurring_activities_periodId_daysOfWeek_idx";

-- AlterTable
ALTER TABLE "recurring_activities" ALTER COLUMN "daysOfWeek" DROP DEFAULT;
