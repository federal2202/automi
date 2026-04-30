/*
  Warnings:

  - You are about to drop the column `active` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `solution` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `description` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedTimeMinutes` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `steps` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `successCriteria` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "active",
DROP COLUMN "solution",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "difficulty" TEXT NOT NULL,
ADD COLUMN     "estimatedTimeMinutes" INTEGER NOT NULL,
ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "isDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resources" JSONB,
ADD COLUMN     "steps" JSONB NOT NULL,
ADD COLUMN     "successCriteria" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "tasks_userId_createdAt_idx" ON "tasks"("userId", "createdAt");
