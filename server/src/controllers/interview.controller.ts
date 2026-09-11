// interview.controller.ts
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { extractTextFromPdf } from "../utils/pdfExtractor"; // reused from Resume Analyzer, Day 12
import {
  generateWelcomeAndFirstQuestion,
  evaluateTurnAndAdvance,
  generateFinalReport,
  InterviewSetupInput,
  SectionPlanItem,
  TurnHistoryItem,
  SectionType,
} from "../utils/interviewAi";

// ─── Duration preset → section plan ────────────────────────────────
// First-pass numbers — easy to retune once you've run a few real sessions.
// RESUME section only gets included if a resume was actually uploaded,
// since asking resume-based questions with no resume is meaningless.
function buildSectionPlan(
  preset: "QUICK" | "STANDARD" | "EXTENDED",
  hasResume: boolean
): SectionPlanItem[] {
  const plans: Record<string, SectionPlanItem[]> = {
    QUICK: [
      { type: "INTRO", count: 1 },
      ...(hasResume ? [{ type: "RESUME" as SectionType, count: 1 }] : []),
      { type: "TECHNICAL", count: 1 },
      { type: "CODING", count: 1 },
      { type: "CLOSING", count: 1 },
    ],
    STANDARD: [
      { type: "INTRO", count: 1 },
      ...(hasResume ? [{ type: "RESUME" as SectionType, count: 1 }] : []),
      { type: "BEHAVIORAL", count: 1 },
      { type: "TECHNICAL", count: 2 },
      { type: "CODING", count: 1 },
      { type: "CLOSING", count: 1 },
    ],
    EXTENDED: [
      { type: "INTRO", count: 1 },
      ...(hasResume ? [{ type: "RESUME" as SectionType, count: 2 }] : []),
      { type: "BEHAVIORAL", count: 2 },
      { type: "TECHNICAL", count: 3 },
      { type: "CODING", count: 1 },
      { type: "CLOSING", count: 1 },
    ],
  };
  return plans[preset];
}

// Reshapes a DB turn row into what interviewAi.ts's functions expect —
// same idea as doubt.controller.ts's history.map(...) reshape.
function toHistoryItem(turn: any): TurnHistoryItem {
  return {
    sectionType: turn.sectionType,
    questionText: turn.questionText,
    isFollowUp: turn.isFollowUp,
    transcript: turn.transcript ?? "",
    metrics: {
      hesitationMs: turn.hesitationMs ?? undefined,
      durationMs: turn.durationMs ?? undefined,
      wordCount: turn.wordCount ?? undefined,
      wpm: turn.wpm ?? undefined,
      fillerWordCount: turn.fillerWordCount ?? undefined,
      longPauseCount: turn.longPauseCount ?? undefined,
    },
  };
}

// ─── POST /api/interview/start ─────────────────────────────────────
export async function startInterview(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { targetRole, skillLevel, persona, durationPreset } = req.body;
    if (!targetRole || !skillLevel || !persona || !durationPreset) {
      return res.status(400).json({
        message: "targetRole, skillLevel, persona, and durationPreset are required",
      });
    }

    // Resume is OPTIONAL per your call — session proceeds without it,
    // the RESUME section just gets skipped from the plan (see above).
    let resumeText: string | undefined;
    let resumeFileName: string | undefined;
    if (req.file) {
      resumeText = await extractTextFromPdf(req.file.buffer);
      resumeFileName = req.file.originalname;
    }

    const sectionPlan = buildSectionPlan(durationPreset, !!resumeText);
    const questionBudget = sectionPlan.reduce((sum, s) => sum + s.count, 0);

    const setup: InterviewSetupInput = {
      targetRole,
      skillLevel,
      persona,
      sectionPlan,
      resumeText,
    };

    // Call Gemini BEFORE touching the DB — same reasoning as
    // generateNewRoadmap: don't half-write a session if generation fails.
    const { welcomeMessage, firstQuestion } = await generateWelcomeAndFirstQuestion(setup);

    const session = await prisma.interviewSession.create({
      data: {
        userId,
        targetRole,
        skillLevel,
        persona,
        durationPreset,
        questionBudget,
        resumeFileName: resumeFileName ?? null,
        resumeText: resumeText ?? null,
        sectionPlan: sectionPlan as any, // Json column
        status: "IN_PROGRESS",
        turns: {
          create: [
            {
              sectionType: "INTRO",
              order: 0,
              questionText: firstQuestion,
              inputMode: "VOICE",
              isFollowUp: false,
            },
          ],
        },
      },
      include: { turns: true },
    });

    res.status(201).json({
      sessionId: session.id,
      welcomeMessage,
      currentTurn: session.turns[0],
    });
  } catch (error) {
    console.error("startInterview error:", error);
    const message = error instanceof Error ? error.message : "Failed to start interview";
    res.status(500).json({ message });
  }
}

// ─── POST /api/interview/:sessionId/answer ─────────────────────────
export async function submitAnswer(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const sessionId = req.params.sessionId as string;
    const { transcript, metrics } = req.body;

    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ message: "transcript is required" });
    }

    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { turns: { orderBy: { order: "asc" } } },
    });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    if (session.status !== "IN_PROGRESS") {
      return res.status(400).json({ message: "This interview session has already ended" });
    }

    // The "open" turn is always the latest one with no transcript yet —
    // see explanation above for why we look it up this way instead of
    // trusting a turnId from the frontend.
    const openTurn = [...session.turns].reverse().find((t) => t.transcript === null);
    if (!openTurn) {
      return res.status(400).json({ message: "No open question to answer" });
    }

    // Save the answer onto the open turn first — if the Gemini call below
    // fails, the transcript is still safely persisted and won't be lost.
    const answeredTurn = await prisma.interviewTurn.update({
      where: { id: openTurn.id },
      data: {
        transcript,
        hesitationMs: metrics?.hesitationMs ?? null,
        durationMs: metrics?.durationMs ?? null,
        wordCount: metrics?.wordCount ?? null,
        wpm: metrics?.wpm ?? null,
        fillerWordCount: metrics?.fillerWordCount ?? null,
        longPauseCount: metrics?.longPauseCount ?? null,
      },
    });

    const priorTurns = session.turns.filter((t) => t.transcript !== null);

    // How many MAIN (non-follow-up) questions of this section have been
    // asked so far, including the one just answered — follow-ups don't
    // count toward the section's planned budget.
    const askedSoFar = [...priorTurns, answeredTurn].filter(
      (t) => t.sectionType === answeredTurn.sectionType && !t.isFollowUp
    ).length;
    const plan = session.sectionPlan as unknown as SectionPlanItem[];
    const targetCount = plan.find((s) => s.type === answeredTurn.sectionType)?.count ?? 1;

    const setup: InterviewSetupInput = {
      targetRole: session.targetRole,
      skillLevel: session.skillLevel as any,
      persona: session.persona as any,
      sectionPlan: plan,
      resumeText: session.resumeText ?? undefined,
    };

    const evaluation = await evaluateTurnAndAdvance({
      setup,
      history: priorTurns.map(toHistoryItem),
      currentTurn: toHistoryItem(answeredTurn),
      sectionProgress: { type: answeredTurn.sectionType as SectionType, askedSoFar, targetCount },
      followUpsUsedOnCurrentQuestion: answeredTurn.isFollowUp ? 1 : 0,
    });

    // Save the evaluation onto the answered turn
    await prisma.interviewTurn.update({
      where: { id: answeredTurn.id },
      data: {
        technicalScore: evaluation.technicalScore,
        communicationScore: evaluation.communicationScore,
        confidenceScore: evaluation.confidenceScore,
        positives: evaluation.positives,
        concerns: evaluation.concerns,
        syntaxNotes: evaluation.syntaxNotes,
        geminiDecision: evaluation.decision,
      },
    });

    // ─── Session complete: aggregate final report, no next turn ───
    if (evaluation.decision === "COMPLETE") {
      const allTurns = await prisma.interviewTurn.findMany({
        where: { sessionId: session.id },
        orderBy: { order: "asc" },
      });

      const report = await generateFinalReport({
        setup,
        turns: allTurns.map((t) => ({
          ...toHistoryItem(t),
          technicalScore: t.technicalScore,
          communicationScore: t.communicationScore,
          confidenceScore: t.confidenceScore,
        })),
      });

      const completedSession = await prisma.interviewSession.update({
        where: { id: session.id },
        data: {
          status: "COMPLETED",
          overallScore: report.overallScore,
          communicationScore: report.communicationScore,
          codingScore: report.codingScore,
          confidenceScore: report.confidenceScore,
          problemSolvingScore: report.problemSolvingScore,
          behavioralScore: report.behavioralScore,
          overallFeedback: report.overallFeedback,
          strengths: report.strengths,
          improvementAreas: report.improvementAreas,
        },
        include: { turns: { orderBy: { order: "asc" } } },
      });

      return res.json({ status: "COMPLETED", session: completedSession });
    }

    // ─── Otherwise: create the next turn (follow-up or next section) ───
    const nextTurn = await prisma.interviewTurn.create({
      data: {
        sessionId: session.id,
        sectionType: evaluation.nextSectionType!,
        order: answeredTurn.order + 1,
        questionText: evaluation.nextQuestion!,
        inputMode: evaluation.nextInputMode!,
        isFollowUp: evaluation.decision === "FOLLOW_UP",
        parentTurnId: evaluation.decision === "FOLLOW_UP" ? answeredTurn.id : null,
      },
    });

    res.json({
      status: "IN_PROGRESS",
      previousTurn: { ...answeredTurn, ...evaluation },
      currentTurn: nextTurn,
    });
  } catch (error) {
    console.error("submitAnswer error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit answer";
    res.status(500).json({ message });
  }
}

// ─── GET /api/interview/:sessionId ──────────────────────────────────
export async function getInterviewSession(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const session = await prisma.interviewSession.findUnique({
      where: { id: req.params.sessionId as string },
      include: { turns: { orderBy: { order: "asc" } } },
    });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    res.json({ session });
  } catch (error) {
    console.error("getInterviewSession error:", error);
    res.status(500).json({ message: "Failed to fetch interview session" });
  }
}

// ─── GET /api/interview/history ─────────────────────────────────────
export async function getInterviewHistory(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const sessions = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        targetRole: true,
        persona: true,
        durationPreset: true,
        status: true,
        overallScore: true,
        createdAt: true,
      },
    });

    res.json({ sessions });
  } catch (error) {
    console.error("getInterviewHistory error:", error);
    res.status(500).json({ message: "Failed to fetch interview history" });
  }
}