import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { generateRoadmap, RoadmapGenerationInput } from "../utils/roadmapAi";

// ─── GET /api/roadmap/suggestions ────────────────────────
export const getRoadmapSuggestions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const strugglingProgress = await prisma.userProblem.findMany({
      where: {
        userId,
        OR: [{ status: "ATTEMPTED" }, { confidence: "LOW" }],
      },
      include: {
        problem: { select: { tags: true } },
      },
    });

    const tagCounts = new Map<string, number>();
    for (const entry of strugglingProgress) {
      for (const tag of entry.problem.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }

    const topWeakTags = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);

    const latestResume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { missingSkills: true },
    });

    const merged = [...new Set([...topWeakTags, ...(latestResume?.missingSkills ?? [])])];

    res.json({ suggestedTopics: merged });
  } catch (error) {
    console.error("getRoadmapSuggestions error:", error);
    res.status(500).json({ message: "Failed to fetch suggestions" });
  }
};

// ─── POST /api/roadmap/generate ──────────────────────────
export const generateNewRoadmap = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { targetRole, skillLevel, timelineWeeks, targetCompanies, weakTopics } = req.body;

    if (!targetRole || !skillLevel || !timelineWeeks) {
      return res
        .status(400)
        .json({ message: "targetRole, skillLevel, and timelineWeeks are required" });
    }

    const input: RoadmapGenerationInput = {
      targetRole,
      skillLevel,
      timelineWeeks: Number(timelineWeeks),
      targetCompanies: targetCompanies || [],
      weakTopics: weakTopics || [],
    };

    // Call Gemini FIRST, before touching the database at all.
    const generated = await generateRoadmap(input);

    // CHANGED: no longer wrapped in prisma.$transaction([...]). A big
    // nested create (weeks -> days -> tasks) can genuinely take longer
    // than Prisma's interactive-transaction timeout allows, and bumping
    // that timeout kept losing the race as roadmaps got bigger (see the
    // repeated P2028 errors at 9+ weeks). Splitting into two plain
    // sequential writes removes that ceiling entirely — a normal write
    // only bounded by the DB connection's own (much longer) timeout.
    //
    // Trade-off: this is no longer atomic. If the create below fails
    // after this succeeds, the user is left with zero active roadmaps.
    // That's an acceptable, safe state — identical to a first-time user
    // who hasn't generated one yet — not a broken one.
    await prisma.roadmap.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    const newRoadmap = await prisma.roadmap.create({
      data: {
        userId,
        targetRole: input.targetRole,
        skillLevel: input.skillLevel,
        timelineWeeks: input.timelineWeeks,
        targetCompanies: input.targetCompanies,
        weakTopics: input.weakTopics,
        isActive: true,
        weeks: {
          create: generated.weeks.map((week) => ({
            weekNumber: week.weekNumber,
            theme: week.theme,
            description: week.description,
            days: {
              create: week.days.map((day) => ({
                dayNumber: day.dayNumber,
                focus: day.focus,
                tasks: {
                  create: day.tasks.map((task) => ({
                    content: task.content,
                    resourceUrl: task.resourceUrl ?? null,
                  })),
                },
              })),
            },
          })),
        },
      },
      include: {
        weeks: {
          orderBy: { weekNumber: "asc" },
          include: {
            days: {
              orderBy: { dayNumber: "asc" },
              include: { tasks: true },
            },
          },
        },
      },
    });

    res.status(201).json({ roadmap: newRoadmap });
  } catch (error) {
    console.error("generateNewRoadmap error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate roadmap";
    res.status(500).json({ message });
  }
};

// ─── GET /api/roadmap/active ──────────────────────────────
export const getActiveRoadmap = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const roadmap = await prisma.roadmap.findFirst({
      where: { userId, isActive: true },
      include: {
        weeks: {
          orderBy: { weekNumber: "asc" },
          include: {
            days: {
              orderBy: { dayNumber: "asc" },
              include: { tasks: true },
            },
          },
        },
      },
    });

    res.json({ roadmap: roadmap ?? null });
  } catch (error) {
    console.error("getActiveRoadmap error:", error);
    res.status(500).json({ message: "Failed to fetch active roadmap" });
  }
};

// ─── GET /api/roadmap/history ─────────────────────────────
export const getRoadmapHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const roadmaps = await prisma.roadmap.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        targetRole: true,
        skillLevel: true,
        timelineWeeks: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json({ roadmaps });
  } catch (error) {
    console.error("getRoadmapHistory error:", error);
    res.status(500).json({ message: "Failed to fetch roadmap history" });
  }
};

// ─── PATCH /api/roadmap/:roadmapId/activate ──────────────
export const activateRoadmap = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const roadmapId = req.params.roadmapId as string;

    const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });

    if (!roadmap || roadmap.userId !== userId) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    if (roadmap.isActive) {
      return res.json({ roadmap });
    }

    // Same reasoning as generateNewRoadmap above — these two writes are
    // small/fast (no nested create involved here), so they're low-risk
    // even without transaction wrapping, and this keeps activateRoadmap
    // consistent with the same pattern.
    await prisma.roadmap.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    const activated = await prisma.roadmap.update({
      where: { id: roadmapId },
      data: { isActive: true },
      include: {
        weeks: {
          orderBy: { weekNumber: "asc" },
          include: {
            days: { orderBy: { dayNumber: "asc" }, include: { tasks: true } },
          },
        },
      },
    });

    res.json({ roadmap: activated });
  } catch (error) {
    console.error("activateRoadmap error:", error);
    res.status(500).json({ message: "Failed to switch active roadmap" });
  }
};

// ─── PATCH /api/roadmap/task/:taskId/toggle ──────────────
export const toggleTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const taskId = req.params.taskId as string;

    const task = await prisma.roadmapTask.findUnique({
      where: { id: taskId },
      include: {
        day: { include: { week: { include: { roadmap: true } } } },
      },
    });

    if (!task || task.day.week.roadmap.userId !== userId) {
      return res.status(404).json({ message: "Task not found" });
    }

    const nextCompleted = !task.isCompleted;

    const updated = await prisma.roadmapTask.update({
      where: { id: taskId },
      data: {
        isCompleted: nextCompleted,
        completedAt: nextCompleted ? new Date() : null,
      },
    });

    res.json({ task: updated });
  } catch (error) {
    console.error("toggleTask error:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
};

// ─── DELETE /api/roadmap/:roadmapId ──────────────────────
export const deleteRoadmap = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const roadmapId = req.params.roadmapId as string;

    const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });

    if (!roadmap || roadmap.userId !== userId) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    await prisma.roadmap.delete({ where: { id: roadmapId } });

    res.json({ message: "Roadmap deleted" });
  } catch (error) {
    console.error("deleteRoadmap error:", error);
    res.status(500).json({ message: "Failed to delete roadmap" });
  }
};