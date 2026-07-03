// problem.controller.ts
// Handles all business logic for Coding Practice: fetching problems,
// creating user-added problems, and updating a user's personal progress.

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// ─── GET /api/problems ───────────────────────────────────
// Returns curated problems + this user's own problems, each merged with
// THIS user's progress (if any exists yet).
export const getAllProblems = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const problems = await prisma.problem.findMany({
      where: {
        OR: [
          { isCurated: true },       // everyone sees curated problems
          { createdById: userId },   // + only YOUR own private additions
        ],
      },
      include: {
        // Only pull in the progress row belonging to the current user,
        // not every user's progress on this problem.
        userProgress: {
          where: { userId },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ problems });
  } catch (error) {
    console.error("getAllProblems error:", error);
    res.status(500).json({ message: "Failed to fetch problems" });
  }
};

// ─── GET /api/problems/:slug ─────────────────────────────
// Returns a single problem's full detail + this user's progress on it.
export const getProblemBySlug = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const slug = req.params.slug as string;

    const problem = await prisma.problem.findUnique({
      where: { slug },
      include: {
        userProgress: {
          where: { userId },
        },
      },
    });

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json({ problem });
  } catch (error) {
    console.error("getProblemBySlug error:", error);
    res.status(500).json({ message: "Failed to fetch problem" });
  }
};

// ─── POST /api/problems ──────────────────────────────────
// Lets a user add their own private problem (isCurated: false, createdById: them).
export const createProblem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { title, difficulty, tags, summary, examples, constraints, hints, estimatedTime, sourceUrl } = req.body;

    // Basic validation — the essentials a problem can't function without.
    if (!title || !difficulty || !summary) {
      return res.status(400).json({ message: "title, difficulty, and summary are required" });
    }

    // Auto-generate a slug from the title, e.g. "My Cool Problem" -> "my-cool-problem-<random>"
    // The random suffix avoids collisions since two DIFFERENT users could name a problem the same thing.
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

    const problem = await prisma.problem.create({
      data: {
        title,
        slug,
        difficulty,
        tags: tags || [],
        summary,
        examples: examples || [],
        constraints,
        hints: hints || [],
        estimatedTime,
        sourceUrl,
        isCurated: false,
        createdById: userId,
      },
    });

    res.status(201).json({ problem });
  } catch (error) {
    console.error("createProblem error:", error);
    res.status(500).json({ message: "Failed to create problem" });
  }
};

// ─── PATCH /api/problems/:id/progress ────────────────────
// Creates or updates the CURRENT user's progress on a problem.
// Uses upsert since a UserProblem row might not exist yet (first time interacting with this problem).
export const updateProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const problemId = req.params.id as string;
    const { status, starred, confidence, notes } = req.body;

    // Build the update payload dynamically — only include fields the client actually sent,
    // so a partial update (e.g. just toggling "starred") doesn't wipe out other fields.
    const data: Record<string, any> = {};
    if (status !== undefined) data.status = status;
    if (starred !== undefined) data.starred = starred;
    if (confidence !== undefined) data.confidence = confidence;
    if (notes !== undefined) data.notes = notes;

    // If marking as SOLVED, stamp lastSolved with the current time automatically.
    if (status === "SOLVED") {
      data.lastSolved = new Date();
    }

    const progress = await prisma.userProblem.upsert({
      where: {
        userId_problemId: { userId, problemId }, // matches the @@unique([userId, problemId]) in schema
      },
      update: {
        ...data,
        // attemptCount increments only on actual attempts, not on every field edit.
        ...(status === "ATTEMPTED" || status === "SOLVED"
          ? { attemptCount: { increment: 1 } }
          : {}),
      },
      create: {
        userId,
        problemId,
        status: status || "NOT_STARTED",
        starred: starred || false,
        confidence,
        notes,
        attemptCount: status === "ATTEMPTED" || status === "SOLVED" ? 1 : 0,
        lastSolved: status === "SOLVED" ? new Date() : null,
      },
    });

    res.json({ progress });
  } catch (error) {
    console.error("updateProgress error:", error);
    res.status(500).json({ message: "Failed to update progress" });
  }
};