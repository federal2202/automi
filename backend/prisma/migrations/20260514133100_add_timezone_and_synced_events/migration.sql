-- AlterTable
ALTER TABLE "users" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- CreateTable
CREATE TABLE "synced_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleEventId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "synced_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "synced_events_userId_idx" ON "synced_events"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "synced_events_sourceType_sourceId_date_key" ON "synced_events"("sourceType", "sourceId", "date");

-- AddForeignKey
ALTER TABLE "synced_events" ADD CONSTRAINT "synced_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
