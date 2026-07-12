-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "roadmaps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "skillLevel" "SkillLevel" NOT NULL,
    "timelineWeeks" INTEGER NOT NULL,
    "targetCompanies" TEXT[],
    "weakTopics" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_weeks" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "theme" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "roadmap_weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_days" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "focus" TEXT NOT NULL,

    CONSTRAINT "roadmap_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_tasks" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "resourceUrl" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "roadmap_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "roadmaps_userId_idx" ON "roadmaps"("userId");

-- CreateIndex
CREATE INDEX "roadmap_weeks_roadmapId_idx" ON "roadmap_weeks"("roadmapId");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_weeks_roadmapId_weekNumber_key" ON "roadmap_weeks"("roadmapId", "weekNumber");

-- CreateIndex
CREATE INDEX "roadmap_days_weekId_idx" ON "roadmap_days"("weekId");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_days_weekId_dayNumber_key" ON "roadmap_days"("weekId", "dayNumber");

-- CreateIndex
CREATE INDEX "roadmap_tasks_dayId_idx" ON "roadmap_tasks"("dayId");

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_weeks" ADD CONSTRAINT "roadmap_weeks_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_days" ADD CONSTRAINT "roadmap_days_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "roadmap_weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_tasks" ADD CONSTRAINT "roadmap_tasks_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "roadmap_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
