// The service layer's job: know how to talk to the /api/problems endpoints,
// and hand back clean typed data. Components should never call `api.get()`
// directly — they call `getAllProblems()` and get back a Promise<Problem[]>,
// no knowledge of URLs or response envelopes required.
//
// Analogy: this is the waiter, not the kitchen. Components ask the waiter
// for "problems," they don't walk into the kitchen and read raw order tickets themselves.

import api from "@/api/axios";
import type { Problem, ProblemsResponse } from "../types/problem";

// Fetches all problems (curated + this user's own additions),
// with each problem's userProgress already joined in by the backend.
export async function getAllProblems(): Promise<Problem[]> {
  const response = await api.get<ProblemsResponse>("/problems");
  // Unwrap { problems: [...] } → just the array.
  // Doing this HERE (once) means every component downstream
  // works with a plain Problem[], not `response.data.problems` everywhere.
  return response.data.problems;
}

// Fetches a single problem by slug — not used by the list page yet,
// but adding it now since the route already exists on the backend,
// and the detail page will need this exact function later.
export async function getProblemBySlug(slug: string): Promise<Problem> {
  const response = await api.get<{ problem: Problem }>(`/problems/${slug}`);
  return response.data.problem;
}


// Updates a problem's progress (starred and/or status) for the current user.
// Called when the user clicks the star icon or cycles the status icon.
// Backend route: PATCH /api/problems/:id/progress
export async function updateProgress(
  problemId: string,
  updates: { starred?: boolean; status?: "NOT_STARTED" | "ATTEMPTED" | "SOLVED" }
): Promise<void> {
  await api.patch(`/problems/${problemId}/progress`, updates);
}



// Creates a new user-added problem (private, not curated).
// Backend route: POST /api/problems
export async function createProblem(payload: {
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  summary: string;
  tags?: string[];
  sourceUrl?: string;
}): Promise<Problem> {
  const response = await api.post<{ problem: Problem }>("/problems", payload);
  return response.data.problem;
}