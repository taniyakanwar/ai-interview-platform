import api from "@/api/axios";
// Same shared axios instance as resumeService — baseURL + JWT interceptor
// already handled, never attach the Authorization header manually here.

// ---------- TYPES ----------

export interface DoubtMessage {
  id: string;
  sessionId: string;
  role: "user" | "model";
  content: string;
  imageUrl: string | null;   // NEW — Cloudinary URL if this message had an attached image, else null
  createdAt: string;
}

export interface DoubtSession {
  id: string;
  userId: string;
  title: string | null;
  problemId: string | null;
  messages: DoubtMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface DoubtHistoryItem {
  id: string;
  title: string | null;
  problemId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageResponse {
  sessionId: string;
  title?: string;
  userMessage: DoubtMessage;
  modelMessage: DoubtMessage;
}

// ---------- API CALLS ----------

export async function sendDoubtMessage(
  message: string,
  sessionId?: string,
  problemId?: string,
  image?: File          // NEW: the raw browser File object, e.g. from an <input type="file"> or a drop event
): Promise<SendMessageResponse> {
  // No image → keep the old plain-JSON path completely untouched. This
  // guarantees Day 13's existing text-only flow can't regress from this
  // change — it's a genuinely separate branch, not a modified one.
  if (!image) {
    const { data } = await api.post<SendMessageResponse>("/doubts", {
      message,
      sessionId,
      problemId,
    });
    return data;
  }

  // With an image, the request body MUST be multipart/form-data — that's
  // the only HTTP-native way to send raw binary bytes alongside regular
  // text fields in one request. FormData is the browser's built-in way
  // to build that kind of body.
  const formData = new FormData();

  // Field name "image" here MUST exactly match upload.single("image")
  // in doubtUpload.ts on the backend — multer looks for that specific
  // field name when parsing the multipart body. If these two strings
  // ever drift apart, req.file will silently stay undefined server-side.
  formData.append("image", image);

  // Everything else rides along as normal form fields. Note the `if`
  // guards: FormData has no concept of "undefined" — appending an
  // undefined sessionId would stringify to the literal text "undefined"
  // and the backend would see a truthy-looking (but garbage) sessionId.
  // Skipping the append entirely is the correct way to say "not present."
  formData.append("message", message);
  if (sessionId) formData.append("sessionId", sessionId);
  if (problemId) formData.append("problemId", problemId);

  // IMPORTANT: do NOT manually set a Content-Type header here. Axios
  // detects a FormData body automatically and sets
  // "multipart/form-data; boundary=----WebKitFormBoundary..." itself —
  // that boundary string is randomly generated per request. If you
  // hardcode "multipart/form-data" yourself without the boundary, multer
  // on the server won't know where one field's data ends and the next
  // begins, and the whole parse breaks.
  const { data } = await api.post<SendMessageResponse>("/doubts", formData);

  return data;
}

export async function getDoubtHistory(): Promise<DoubtHistoryItem[]> {
  const { data } = await api.get<DoubtHistoryItem[]>("/doubts");
  return data;
}

export async function getDoubtSessionById(id: string): Promise<DoubtSession> {
  const { data } = await api.get<DoubtSession>(`/doubts/${id}`);
  return data;
}

export async function deleteDoubtSession(id: string): Promise<void> {
  await api.delete(`/doubts/${id}`);
}