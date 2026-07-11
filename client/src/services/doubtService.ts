import api from "@/api/axios";
// Same shared axios instance as resumeService — baseURL + JWT interceptor
// already handled, never attach the Authorization header manually here.

// ---------- TYPES ----------
// These mirror the exact JSON shapes doubt.controller.ts sends back.

export interface DoubtMessage {
  id: string;              // UUID, Prisma-generated primary key
  sessionId: string;       // which session this message belongs to
  role: "user" | "model";  // "user" = student's question, "model" = Gemini's reply
  content: string;         // the actual text (student's question OR Gemini's explanation)
  createdAt: string;       // ISO date string
}

export interface DoubtSession {
  // Full session shape, used when loading one conversation's full thread
  // (matches getDoubtSessionById's response — includes all messages).
  id: string;
  userId: string;
  title: string | null;
  problemId: string | null;
  messages: DoubtMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface DoubtHistoryItem {
  // Lighter version — matches the `select` clause in getDoubtHistory on
  // the backend, which deliberately omits the messages array to keep
  // the sidebar list payload small (same reasoning as ResumeHistoryItem).
  id: string;
  title: string | null;
  problemId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageResponse {
  // Shape returned by POST /api/doubts — covers BOTH cases (new session
  // and follow-up), since the backend's sendDoubtMessage handles both
  // and returns the same shape either way.
  sessionId: string;
  title?: string;              // only present on Case 2 (brand new session)
  userMessage: DoubtMessage;
  modelMessage: DoubtMessage;
}

// ---------- API CALLS ----------

export async function sendDoubtMessage(
  message: string,          // the student's question text
  sessionId?: string,       // pass this to continue an EXISTING session (a follow-up)
  problemId?: string        // pass this ONLY when starting a session from a Coding Practice problem
): Promise<SendMessageResponse> {
  // Plain JSON body — unlike resumeService's analyzeResume, there's no
  // file involved here, so no FormData/multipart headers needed.
  //
  // POST payload sent to server: { message, sessionId?, problemId? }
  // Response payload received back: { sessionId, title?, userMessage, modelMessage }
  // — exactly what curl tests printed earlier.
  const { data } = await api.post<SendMessageResponse>("/doubts", {
    message,
    sessionId,
    problemId,
  });

  return data;
}


export async function getDoubtHistory(): Promise<DoubtHistoryItem[]> {
  // GET request, no payload needed — userId comes from the JWT via `protect` middleware.
  // Response payload: array of lightweight DoubtHistoryItem objects,
  // ordered by updatedAt desc (most recently active conversation first —
  // see getDoubtHistory's orderBy on the backend).
  const { data } = await api.get<DoubtHistoryItem[]>("/doubts");
  return data;
}

export async function getDoubtSessionById(id: string): Promise<DoubtSession> {
  // GET request with the session's UUID in the URL path.
  // Response payload: the FULL DoubtSession object including the entire
  // messages array — used when a user clicks a past conversation in the
  // sidebar to load it back into the chat window.
  const { data } = await api.get<DoubtSession>(`/doubts/${id}`);
  return data;
}

export async function deleteDoubtSession(id: string): Promise<void> {
  await api.delete(`/doubts/${id}`);
}