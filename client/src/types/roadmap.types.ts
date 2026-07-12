// roadmap.types.ts
// Single source of truth for Roadmap Generator shapes on the frontend.
// Every field here mirrors the Prisma models exactly (see schema.prisma)
// — so a response from roadmap.controller.ts can be typed directly
// without any reshaping.

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface RoadmapTask {
  id: string;
  dayId: string;
  content: string;
  resourceUrl: string | null;
  isCompleted: boolean;
  completedAt: string | null; // ISO string over the wire, same as your other DateTime fields
}

export interface RoadmapDay {
  id: string;
  weekId: string;
  dayNumber: number;
  focus: string;
  tasks: RoadmapTask[];
}

export interface RoadmapWeek {
  id: string;
  roadmapId: string;
  weekNumber: number;
  theme: string;
  description: string | null;
  days: RoadmapDay[];
}

export interface Roadmap {
  id: string;
  userId: string;
  targetRole: string;
  skillLevel: SkillLevel;
  timelineWeeks: number;
  targetCompanies: string[];
  weakTopics: string[];
  isActive: boolean;
  weeks: RoadmapWeek[];
  createdAt: string;
  updatedAt: string;
}

// Lightweight shape for the history list — matches the `select` in
// getRoadmapHistory on the backend (no nested weeks/days/tasks, since
// the history panel only needs to show a label per roadmap).
export interface RoadmapHistoryItem {
  id: string;
  targetRole: string;
  skillLevel: SkillLevel;
  timelineWeeks: number;
  isActive: boolean;
  createdAt: string;
}

// What the generate form sends. Matches RoadmapGenerationInput in
// roadmapAi.ts on the backend — kept as a separate type (not reusing
// Roadmap) since the form has no id/isActive/weeks yet at this point.
export interface RoadmapGenerateInput {
  targetRole: string;
  skillLevel: SkillLevel;
  timelineWeeks: number;
  targetCompanies: string[];
  weakTopics: string[];
}