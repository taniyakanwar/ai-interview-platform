// interview.types.ts
// Mirrors the Prisma models + interviewAi.ts shapes, same role as
// roadmap.types.ts — this is the single source of truth for what an
// interview session/turn looks like on the frontend, so the service,
// hook, and components all agree on shape without redefining it three times.

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type Persona = "FRIENDLY" | "FAANG" | "HIRING_MANAGER";
export type DurationPreset = "QUICK" | "STANDARD" | "EXTENDED";
export type SectionType =
  | "INTRO" | "RESUME" | "BEHAVIORAL" | "TECHNICAL" | "CODING" | "CLOSING";
export type SessionStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
export type InputMode = "VOICE" | "TEXT";
export type TurnDecision = "FOLLOW_UP" | "NEXT_SECTION" | "COMPLETE";

// Static persona metadata — display-only info the backend doesn't need to
// know about (emoji, description, color). Kept here rather than duplicated
// across InterviewSetup.tsx and InterviewSession.tsx.
export interface PersonaInfo {
  id: Persona;
  name: string;
  emoji: string;
  tagline: string;
}

export const PERSONAS: PersonaInfo[] = [
  { id: "FRIENDLY", name: "Ava", emoji: "🙂", tagline: "Patient, offers hints, takes it slow" },
  { id: "FAANG", name: "Noah", emoji: "😐", tagline: "Terse, sharp follow-ups, minimal reactions" },
  { id: "HIRING_MANAGER", name: "Claire", emoji: "💼", tagline: "Behavioral-heavy, probes leadership" },
];

export const DURATION_PRESETS: { id: DurationPreset; label: string; questionCount: number }[] = [
  { id: "QUICK", label: "Quick (~15 min)", questionCount: 4 },
  { id: "STANDARD", label: "Standard (~30 min)", questionCount: 7 },
  { id: "EXTENDED", label: "Extended (~45 min)", questionCount: 10 },
];

// --- Setup form input, sent to POST /api/interview/start ---
export interface InterviewStartInput {
  targetRole: string;
  skillLevel: SkillLevel;
  persona: Persona;
  durationPreset: DurationPreset;
  resumeFile?: File; // optional — sent as multipart/form-data, not JSON, when present
}

// --- Speech-pattern metrics computed client-side by useInterview.ts,
// sent alongside the transcript on every VOICE-mode answer. All optional
// since a TEXT-mode (CODING) turn has none of these. ---
export interface TurnMetrics {
  hesitationMs?: number;
  durationMs?: number;
  wordCount?: number;
  wpm?: number;
  fillerWordCount?: number;
  longPauseCount?: number;
}

// --- A single turn, matching InterviewTurn 1:1 ---
export interface InterviewTurn {
  id: string;
  sessionId: string;
  sectionType: SectionType;
  order: number;
  questionText: string;
  inputMode: InputMode;
  isFollowUp: boolean;
  parentTurnId: string | null;
  transcript: string | null;

  hesitationMs: number | null;
  durationMs: number | null;
  wordCount: number | null;
  wpm: number | null;
  fillerWordCount: number | null;
  longPauseCount: number | null;

  technicalScore: number | null;
  communicationScore: number | null;
  confidenceScore: number | null;
  positives: string[];
  concerns: string[];
  syntaxNotes: string | null;
  geminiDecision: TurnDecision | null;

  createdAt: string;
}

// --- Full session, matching InterviewSession 1:1 ---
export interface InterviewSession {
  id: string;
  userId: string;
  targetRole: string;
  skillLevel: SkillLevel;
  persona: Persona;
  durationPreset: DurationPreset;
  questionBudget: number;
  resumeFileName: string | null;
  resumeText: string | null;
  sectionPlan: { type: SectionType; count: number }[];
  status: SessionStatus;

  overallScore: number | null;
  communicationScore: number | null;
  codingScore: number | null;
  confidenceScore: number | null;
  problemSolvingScore: number | null;
  behavioralScore: number | null;
  overallFeedback: string | null;
  strengths: string[];
  improvementAreas: string[];

  turns: InterviewTurn[];
  createdAt: string;
  updatedAt: string;
}

// --- Lightweight list item for the history/timeline panel ---
export interface InterviewHistoryItem {
  id: string;
  targetRole: string;
  persona: Persona;
  durationPreset: DurationPreset;
  status: SessionStatus;
  overallScore: number | null;
  createdAt: string;
}

// --- Response shapes from each endpoint ---
export interface StartInterviewResponse {
  sessionId: string;
  welcomeMessage: string;
  currentTurn: InterviewTurn;
}

export interface SubmitAnswerResponse {
  status: "IN_PROGRESS" | "COMPLETED";
  previousTurn?: InterviewTurn; // present on IN_PROGRESS
  currentTurn?: InterviewTurn;  // present on IN_PROGRESS
  session?: InterviewSession;   // present on COMPLETED — the full final report
}