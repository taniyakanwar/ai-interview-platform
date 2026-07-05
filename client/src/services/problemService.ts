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