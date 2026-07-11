import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getDoubtResponse, ChatTurn } from "../utils/doubtAi";


// Builds a short, readable session title from the first message — shown
// in the sidebar list, like ChatGPT auto-titling a new conversation.
// We just truncate rather than calling Gemini again purely for a title —
// that would be a wasted API call for something cosmetic.
function generateTitle(firstMessage: string, problemTitle?: string): string {
  if (problemTitle) return `Doubt on: ${problemTitle}`;
  const trimmed = firstMessage.trim();
  return trimmed.length > 50 ? trimmed.slice(0, 50) + "..." : trimmed;
}

/**
 * Handles BOTH starting a new session AND sending a follow-up in an
 * existing one — because we chose lazy creation, there's no separate
 * "create empty session" step. The frontend just calls this every time
 * the student hits send; whether sessionId is present tells us which case we're in.
 */
export async function sendDoubtMessage(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { message, sessionId, problemId } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // ---- CASE 1: continuing an existing session (a follow-up question) ----
    if (sessionId) {
      const session = await prisma.doubtSession.findUnique({
        where: { id: sessionId },
        include: {
          // oldest first — Gemini needs the transcript in chronological
          // order, same order the conversation actually happened in
          messages: { orderBy: { createdAt: "asc" } },
        },
      });

      // Same ownership check pattern as getResumeById — don't reveal
      // whether the session exists at all if it isn't this user's.
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Doubt session not found" });
      }

      // Reshape DB rows into the {role, content} shape doubtAi.ts expects
      const history: ChatTurn[] = session.messages.map((m) => ({
        role: m.role as "user" | "model",
        content: m.content,
      }));

      // No problemContext here — that only gets injected on the FIRST
      // message of a session (see Case 2). By now it's already baked
      // into the history from that first exchange.
      const reply = await getDoubtResponse(history, message);

      // Save both the student's new message and Gemini's reply as two
      // new rows — $transaction ensures either BOTH get saved or
      // NEITHER does (avoids a half-saved conversation if the DB
      // hiccups between the two inserts).
      const [userMsg, modelMsg] = await prisma.$transaction([
        prisma.doubtMessage.create({
          data: { sessionId: session.id, role: "user", content: message },
        }),
        prisma.doubtMessage.create({
          data: { sessionId: session.id, role: "model", content: reply },
        }),
      ]);

      // Bump updatedAt so the sidebar can sort "most recently active" first
      await prisma.doubtSession.update({
        where: { id: session.id },
        data: { updatedAt: new Date() },
      });

      return res.status(200).json({
        sessionId: session.id,
        userMessage: userMsg,
        modelMessage: modelMsg,
      });
    }

    // ---- CASE 2: brand new session (this is the student's first message) ----

    // If opened "from a problem", fetch its details to give Gemini context
    // — e.g. "the student is asking about Two Sum" instead of a question
    // floating with zero context.
    let problemContext: string | undefined;
    let problemTitle: string | undefined;

    if (problemId) {
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
      });
      if (problem) {
        problemTitle = problem.title;
        problemContext = `${problem.title}\n${problem.summary ?? ""}`;
      }
      // If problemId was passed but doesn't match a real problem, we just
      // silently skip context rather than failing the whole request —
      // a missing/stale problemId shouldn't block the student from asking their question.
    }

    const reply = await getDoubtResponse([], message, problemContext);
    const title = generateTitle(message, problemTitle);

    // Create the session AND its first two messages together as one
    // transaction — this is the moment the "empty session" actually
    // comes into existence, matching the lazy-creation decision.
    const session = await prisma.doubtSession.create({
      data: {
        userId,
        title,
        problemId: problemId || null,
        messages: {
          create: [
            { role: "user", content: message },
            { role: "model", content: reply },
          ],
        },
      },
      include: { messages: true },
    });

    return res.status(201).json({
      sessionId: session.id,
      title: session.title,
      userMessage: session.messages[0],
      modelMessage: session.messages[1],
    });
  } catch (err) {
    console.error("Doubt message failed:", err);
    const message =
      err instanceof Error ? err.message : "Failed to process doubt message";
    return res.status(500).json({ message });
  }
}

// Sidebar list — same lightweight-select pattern as getResumeHistory,
// no need to send full message threads just to render a list of titles.
export async function getDoubtHistory(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const sessions = await prisma.doubtSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        problemId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(sessions);
  } catch (err) {
    console.error("Failed to fetch doubt history:", err);
    return res.status(500).json({ message: "Failed to fetch doubt history" });
  }
}

// Full thread — called when clicking a session in the sidebar, to load
// the whole conversation back into the chat window.
export async function getDoubtSessionById(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const session = await prisma.doubtSession.findUnique({
      where: { id: req.params.id as string },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ message: "Doubt session not found" });
    }

    return res.json(session);
  } catch (err) {
    console.error("Failed to fetch doubt session:", err);
    return res.status(500).json({ message: "Failed to fetch doubt session" });
  }
}

export async function deleteDoubtSession(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const session = await prisma.doubtSession.findUnique({
      where: { id: req.params.id as string },
    });

    // Same ownership check pattern as every other endpoint — don't
    // reveal whether a session exists if it belongs to someone else.
    if (!session || session.userId !== userId) {
      return res.status(404).json({ message: "Doubt session not found" });
    }

    // Deleting the session automatically deletes all its DoubtMessage
    // rows too — that's what onDelete: Cascade in your schema does,
    // no need to manually delete messages first.
    await prisma.doubtSession.delete({ where: { id: session.id } });

    return res.status(200).json({ message: "Session deleted" });
  } catch (err) {
    console.error("Failed to delete doubt session:", err);
    return res.status(500).json({ message: "Failed to delete session" });
  }
}