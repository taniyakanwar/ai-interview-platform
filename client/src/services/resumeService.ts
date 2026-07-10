import api from "@/api/axios"; 
// api = your shared axios instance (already has baseURL + JWT interceptor 
// Every request through this automatically carries 
//Authorization header —  never manually attach the token here.

// ---------- TYPES ----------
// These describe the exact JSON shape your backend sends back.
// Matching them precisely means TypeScript will catch it immediately
// if the backend response shape ever changes/breaks.

export interface ScoreBreakdown {
  [check: string]: string; 
  // Payload example: { "Standard section headers present": "4/4", "Contact information detectable": "1/2" }
  // Key = the check's label (from atsScoring.ts), value = "score/maxScore" as a string.
}

export interface AiSuggestion {
  issue: string;      // Payload example: "Freelance section lacks quantification"
  suggestion: string; // Payload example: "Rephrase with numbers: 'Delivered 3+ apps...'"
}

export interface Resume {
  id: string;               // UUID, Prisma-generated primary key
  userId: string;           // which user this resume belongs to
  fileUrl: string;          // Cloudinary URL — where the actual PDF is hosted
  fileName: string;         // original filename, e.g. "taniya_resume.pdf"
  extractedText: string;    // full raw text pulled from the PDF (pdf-parse output)
  targetJD: string | null;  // the pasted job description, or null if none was given
  atsScore: number;         // final 0-100 score
  scoreBreakdown: ScoreBreakdown; // per-check score detail, see above
  missingSkills: string[];  // keywords found in JD but not in resume (empty if no JD)
  suggestions: AiSuggestion[]; // Gemini-generated improvement suggestions
  createdAt: string;        // ISO date string, e.g. "2026-07-10T05:10:42.908Z"
}

export interface ResumeHistoryItem {
  // Lighter version — matches the `select` clause in getResumeHistory 
  // on the backend, which deliberately omits extractedText/suggestions
  // to keep the history-list payload small.
  id: string;
  fileName: string;
  atsScore: number;
  targetJD: string | null;
  createdAt: string;
}

// ---------- API CALLS ----------

export async function analyzeResume(
  file: File,        // the actual PDF File object, straight from an <input type="file"> or drop event
  targetJD?: string   // optional pasted job description text
): Promise<Resume> {
  // FormData is required (not a plain JSON object) because we're sending
  // a real binary file. The browser automatically sets the correct
  // multipart/form-data boundary header when you pass FormData —
  // you can't replicate this with JSON.stringify + a normal object.
  const formData = new FormData();

  formData.append("resume", file); 
  // "resume" here MUST match the field name your multer middleware expects:
  // uploadResume.single("resume") on the backend route.

  if (targetJD) {
    formData.append("targetJD", targetJD); 
    // Only appended if provided — backend treats a missing field as "no JD given".
  }

  // POST payload sent to server: multipart form with two fields —
  // "resume" (binary file) and optionally "targetJD" (plain text).
  // Response payload received back: a full Resume object (see interface above),
  // exactly what your curl test printed earlier — score, breakdown, suggestions, etc.
  const { data } = await api.post<Resume>("/resume/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    // Explicitly setting this ensures axios doesn't default to
    // application/json, which would break the file upload entirely.
  });

  return data; // the parsed Resume object, ready to store in React state
}

export async function getResumeHistory(): Promise<ResumeHistoryItem[]> {
  // GET request, no payload needed — userId comes from the JWT via `protect` middleware.
  // Response payload: an array of lightweight ResumeHistoryItem objects,
  // ordered newest-first (per your controller's orderBy: createdAt desc).
  const { data } = await api.get<ResumeHistoryItem[]>("/resume");
  return data;
}

export async function getResumeById(id: string): Promise<Resume> {
  // GET request with the resume's UUID in the URL path.
  // Response payload: the FULL Resume object (includes extractedText + suggestions),
  // used when a user clicks into a specific past analysis from their history.
  const { data } = await api.get<Resume>(`/resume/${id}`);
  return data;
}