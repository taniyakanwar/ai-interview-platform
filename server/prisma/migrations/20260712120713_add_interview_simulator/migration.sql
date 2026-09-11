-- CreateEnum
CREATE TYPE "InterviewPersona" AS ENUM ('FRIENDLY', 'FAANG', 'HIRING_MANAGER');

-- CreateEnum
CREATE TYPE "DurationPreset" AS ENUM ('QUICK', 'STANDARD', 'EXTENDED');

-- CreateEnum
CREATE TYPE "SessionSectionType" AS ENUM ('INTRO', 'RESUME', 'BEHAVIORAL', 'TECHNICAL', 'CODING', 'CLOSING');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "InputMode" AS ENUM ('VOICE', 'TEXT');

-- CreateEnum
CREATE TYPE "TurnDecision" AS ENUM ('FOLLOW_UP', 'NEXT_SECTION', 'COMPLETE');

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "skillLevel" "SkillLevel" NOT NULL,
    "persona" "InterviewPersona" NOT NULL,
    "durationPreset" "DurationPreset" NOT NULL,
    "questionBudget" INTEGER NOT NULL,
    "resumeFileName" TEXT,
    "resumeText" TEXT,
    "sectionPlan" JSONB NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "overallScore" DOUBLE PRECISION,
    "communicationScore" DOUBLE PRECISION,
    "codingScore" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION,
    "problemSolvingScore" DOUBLE PRECISION,
    "behavioralScore" DOUBLE PRECISION,
    "overallFeedback" TEXT,
    "strengths" TEXT[],
    "improvementAreas" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_turns" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sectionType" "SessionSectionType" NOT NULL,
    "order" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "inputMode" "InputMode" NOT NULL,
    "isFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "parentTurnId" TEXT,
    "transcript" TEXT,
    "hesitationMs" INTEGER,
    "durationMs" INTEGER,
    "wordCount" INTEGER,
    "wpm" DOUBLE PRECISION,
    "fillerWordCount" INTEGER,
    "longPauseCount" INTEGER,
    "technicalScore" DOUBLE PRECISION,
    "communicationScore" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION,
    "positives" TEXT[],
    "concerns" TEXT[],
    "syntaxNotes" TEXT,
    "geminiDecision" "TurnDecision",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_turns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_sessions_userId_idx" ON "interview_sessions"("userId");

-- CreateIndex
CREATE INDEX "interview_turns_sessionId_idx" ON "interview_turns"("sessionId");

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_turns" ADD CONSTRAINT "interview_turns_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_turns" ADD CONSTRAINT "interview_turns_parentTurnId_fkey" FOREIGN KEY ("parentTurnId") REFERENCES "interview_turns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
