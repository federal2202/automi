-- CreateTable
CREATE TABLE "recurring_activities" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurring_activities_userId_periodId_idx" ON "recurring_activities"("userId", "periodId");

-- CreateIndex
CREATE INDEX "recurring_activities_periodId_dayOfWeek_idx" ON "recurring_activities"("periodId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "recurring_activities" ADD CONSTRAINT "recurring_activities_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_activities" ADD CONSTRAINT "recurring_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
