// interviewService.ts
// Thin axios wrapper around the 4 interview endpoints — same role as
// roadmapService.ts, using the shared axios instance (with its JWT
// interceptor) from Day 5-6 rather than raw axios calls.

import api from "@/api/axios"; // adjust to your actual shared axios instance path
import {
  InterviewStartInput,
  StartInterviewResponse,
  SubmitAnswerResponse,
  InterviewSession,
  InterviewHistoryItem,
  TurnMetrics,
} from "@/types/interview.types";

// POST /api/interview/start
// Branches on whether a resume file is present. multipart/form-data ONLY
// when there's an actual file to send — sending FormData for a plain
// JSON-shaped request (no resume) works but is unnecessary overhead and
// makes the request harder to debug in devtools, so we keep JSON as the
// default path and only reach for FormData when a File is actually there.
export async function startInterview(
  input: InterviewStartInput
): Promise<StartInterviewResponse> {
  if (input.resumeFile) {
    const formData = new FormData();
    formData.append("targetRole", input.targetRole);
    formData.append("skillLevel", input.skillLevel);
    formData.append("persona", input.persona);
    formData.append("durationPreset", input.durationPreset);
    formData.append("resume", input.resumeFile); // field name MUST match upload.single("resume") in interview.routes.ts

    const { data } = await api.post<StartInterviewResponse>(
      "/interview/start",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  }

  const { data } = await api.post<StartInterviewResponse>("/interview/start", {
    targetRole: input.targetRole,
    skillLevel: input.skillLevel,
    persona: input.persona,
    durationPreset: input.durationPreset,
  });
  return data;
}

// POST /api/interview/:sessionId/answer
// Always JSON — even for CODING-section turns, since typed code is just
// a string in `transcript`, never a file. metrics is optional because
// TEXT-mode turns have none (see TurnMetrics being all-optional fields).
export async function submitAnswer(
  sessionId: string,
  transcript: string,
  metrics?: TurnMetrics
): Promise<SubmitAnswerResponse> {
  const { data } = await api.post<SubmitAnswerResponse>(
    `/interview/${sessionId}/answer`,
    { transcript, metrics }
  );
  return data;
}

// GET /api/interview/:sessionId
export async function getInterviewSession(sessionId: string): Promise<InterviewSession> {
  const { data } = await api.get<{ session: InterviewSession }>(
    `/interview/${sessionId}`
  );
  return data.session;
}

// GET /api/interview/history
export async function getInterviewHistory(): Promise<InterviewHistoryItem[]> {
  const { data } = await api.get<{ sessions: InterviewHistoryItem[] }>(
    "/interview/history"
  );
  return data.sessions;
}