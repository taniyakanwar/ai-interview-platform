// roadmapService.ts
// Thin wrapper around the shared axios instance — one function per
// backend endpoint, each returning already-typed data. Mirrors the
// pattern implied by doubtService.ts (used inside useDoubtSolver.ts):
// the hook should never call `api` directly, only these functions.

import api from "@/api/axios";
import {
  Roadmap,
  RoadmapHistoryItem,
  RoadmapGenerateInput,
  RoadmapTask,
} from "@/types/roadmap.types";

// GET /api/roadmap/suggestions — pre-fill weak topics before generating
export async function getRoadmapSuggestions(): Promise<string[]> {
  const res = await api.get("/roadmap/suggestions");
  return res.data.suggestedTopics;
}

// POST /api/roadmap/generate
export async function generateRoadmap(
  input: RoadmapGenerateInput
): Promise<Roadmap> {
  const res = await api.post("/roadmap/generate", input);
  return res.data.roadmap;
}

// GET /api/roadmap/active — returns null if the user has none yet
export async function getActiveRoadmap(): Promise<Roadmap | null> {
  const res = await api.get("/roadmap/active");
  return res.data.roadmap;
}

// GET /api/roadmap/history
export async function getRoadmapHistory(): Promise<RoadmapHistoryItem[]> {
  const res = await api.get("/roadmap/history");
  return res.data.roadmaps;
}

// PATCH /api/roadmap/:roadmapId/activate
export async function activateRoadmap(roadmapId: string): Promise<Roadmap> {
  const res = await api.patch(`/roadmap/${roadmapId}/activate`);
  return res.data.roadmap;
}

// PATCH /api/roadmap/task/:taskId/toggle
export async function toggleRoadmapTask(taskId: string): Promise<RoadmapTask> {
  const res = await api.patch(`/roadmap/task/${taskId}/toggle`);
  return res.data.task;
}

// DELETE /api/roadmap/:roadmapId
export async function deleteRoadmap(roadmapId: string): Promise<void> {
  await api.delete(`/roadmap/${roadmapId}`);
}