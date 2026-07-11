-- CreateTable
CREATE TABLE "DoubtSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "problemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoubtSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoubtMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoubtMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DoubtSession_userId_idx" ON "DoubtSession"("userId");

-- CreateIndex
CREATE INDEX "DoubtMessage_sessionId_idx" ON "DoubtMessage"("sessionId");

-- AddForeignKey
ALTER TABLE "DoubtSession" ADD CONSTRAINT "DoubtSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtSession" ADD CONSTRAINT "DoubtSession_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtMessage" ADD CONSTRAINT "DoubtMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DoubtSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
