// interviewAi.ts
import { Type } from "@google/genai";
import { callGeminiWithRetry } from "./geminiClient";

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type Persona = "FRIENDLY" | "FAANG" | "HIRING_MANAGER";
export type SectionType =
  | "INTRO" | "RESUME" | "BEHAVIORAL" | "TECHNICAL" | "CODING" | "CLOSING";
export type InputMode = "VOICE" | "TEXT";
export type TurnDecision = "FOLLOW_UP" | "NEXT_SECTION" | "COMPLETE";

export interface SectionPlanItem {
  type: SectionType;
  count: number;
}

export interface InterviewSetupInput {
  targetRole: string;
  skillLevel: SkillLevel;
  persona: Persona;
  sectionPlan: SectionPlanItem[];
  resumeText?: string;
}

export interface TurnMetrics {
  hesitationMs?: number;
  durationMs?: number;
  wordCount?: number;
  wpm?: number;
  fillerWordCount?: number;
  longPauseCount?: number;
}

export interface TurnHistoryItem {
  sectionType: SectionType;
  questionText: string;
  isFollowUp: boolean;
  transcript: string;
  metrics?: TurnMetrics;
}

export interface EvaluateTurnInput {
  setup: InterviewSetupInput;
  history: TurnHistoryItem[];
  currentTurn: TurnHistoryItem;
  sectionProgress: { type: SectionType; askedSoFar: number; targetCount: number };
  followUpsUsedOnCurrentQuestion: number;
}

export interface TurnEvaluation {
  technicalScore: number | null;
  communicationScore: number | null;
  confidenceScore: number | null;
  positives: string[];
  concerns: string[];
  syntaxNotes: string | null;
  decision: TurnDecision;
  nextSectionType: SectionType | null;
  nextInputMode: InputMode | null;
  nextQuestion: string | null;
}

export interface FinalReportInput {
  setup: InterviewSetupInput;
  turns: (TurnHistoryItem & {
    technicalScore: number | null;
    communicationScore: number | null;
    confidenceScore: number | null;
  })[];
}

export interface FinalReport {
  overallScore: number;
  communicationScore: number;
  codingScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  behavioralScore: number;
  overallFeedback: string;
  strengths: string[];
  improvementAreas: string[];
}

const PERSONA_VOICE: Record<Persona, string> = {
  FRIENDLY: `You are Ava, a warm, patient interviewer. Offer encouragement ("take your time", "no rush"). If the candidate is clearly struggling, gently offer to rephrase rather than staying silent. Still evaluate honestly — warmth doesn't mean inflated scores.`,
  FAANG: `You are Noah, a sharp, minimal-affect FAANG-style interviewer. Keep your questions terse and professional. Ask pointed follow-ups that probe edge cases and trade-offs. Do not offer hints or encouragement.`,
  HIRING_MANAGER: `You are Claire, a hiring manager focused on leadership, ownership, and communication. Weight behavioral depth heavily — probe for specifics ("what did YOU do", "how did you handle the disagreement") rather than accepting vague team-level answers.`,
};

const welcomeSchema = {
  type: Type.OBJECT,
  properties: {
    welcomeMessage: { type: Type.STRING },
    firstQuestion: { type: Type.STRING },
  },
  required: ["welcomeMessage", "firstQuestion"],
};

export async function generateWelcomeAndFirstQuestion(
  setup: InterviewSetupInput
): Promise<{ welcomeMessage: string; firstQuestion: string }> {
  const resumeLine = setup.resumeText
    ? `The candidate uploaded a resume. Excerpt:\n${setup.resumeText.slice(0, 2000)}`
    : "No resume was uploaded for this session.";

  const systemInstruction = `${PERSONA_VOICE[setup.persona]}

You are conducting a mock interview for the role: ${setup.targetRole} (candidate skill level: ${setup.skillLevel}).
${resumeLine}

Write a short (2-3 sentence), human, in-character welcome message — greet the candidate, briefly set expectations, nothing robotic or templated. Then write the FIRST question, which is always an introduction question ("tell me about yourself" style, in your own persona's voice — not verbatim that phrase).

Return ONLY the JSON structure. No markdown, no preamble.`;

  const response = await callGeminiWithRetry("Begin the interview.", {
    systemInstruction,
    responseMimeType: "application/json",
    responseSchema: welcomeSchema,
    temperature: 0.8,
  });

  if (!response.text) throw new Error("Gemini returned no welcome content");
  return JSON.parse(response.text);
}

const evaluationSchema = {
  type: Type.OBJECT,
  properties: {
    technicalScore: { type: Type.NUMBER, nullable: true },
    communicationScore: { type: Type.NUMBER, nullable: true },
    confidenceScore: { type: Type.NUMBER, nullable: true },
    positives: { type: Type.ARRAY, items: { type: Type.STRING } },
    concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
    syntaxNotes: { type: Type.STRING, nullable: true },
    decision: { type: Type.STRING, enum: ["FOLLOW_UP", "NEXT_SECTION", "COMPLETE"] },
    nextSectionType: {
      type: Type.STRING,
      enum: ["INTRO", "RESUME", "BEHAVIORAL", "TECHNICAL", "CODING", "CLOSING"],
      nullable: true,
    },
    nextInputMode: { type: Type.STRING, enum: ["VOICE", "TEXT"], nullable: true },
    nextQuestion: { type: Type.STRING, nullable: true },
  },
  required: ["technicalScore", "communicationScore", "confidenceScore", "positives", "concerns", "decision"],
};

function formatMetrics(m?: TurnMetrics): string {
  if (!m) return "No speech metrics (text input).";
  return `hesitation before answering: ${m.hesitationMs}ms, pace: ${m.wpm} wpm, filler words used: ${m.fillerWordCount}, long pauses mid-answer: ${m.longPauseCount}`;
}

export async function evaluateTurnAndAdvance(
  input: EvaluateTurnInput
): Promise<TurnEvaluation> {
  const { setup, history, currentTurn, sectionProgress, followUpsUsedOnCurrentQuestion } = input;

  const isCoding = currentTurn.sectionType === "CODING";

  const historyBlock = history
    .map((t) => `[${t.sectionType}] Q: ${t.questionText}\nA: ${t.transcript}`)
    .join("\n\n");

  const codingRule = isCoding
    ? `\nThis is a CODING turn — the candidate typed code as their answer. Score technicalScore based ONLY on logic, approach, and data-structure/algorithm choice. If you notice syntax issues (missing brackets, commas, semicolons, typos), mention them briefly in syntaxNotes — but they must NOT lower technicalScore. communicationScore and confidenceScore should be null for this turn (no speech to evaluate).`
    : "";

  const followUpRule =
    followUpsUsedOnCurrentQuestion >= 1
      ? "\nA follow-up has ALREADY been asked on this question. You may NOT choose FOLLOW_UP again — choose NEXT_SECTION or COMPLETE."
      : "";

  const systemInstruction = `${PERSONA_VOICE[setup.persona]}

You are mid-interview for role: ${setup.targetRole} (level: ${setup.skillLevel}).
Section plan: ${JSON.stringify(setup.sectionPlan)}
Current section: ${sectionProgress.type}, question ${sectionProgress.askedSoFar} of ${sectionProgress.targetCount} planned for this section.
${codingRule}${followUpRule}

Conversation so far:
${historyBlock || "(this is the first scored turn)"}

Now evaluate the candidate's latest answer:
Q: ${currentTurn.questionText}
A: ${currentTurn.transcript}
Speech signal: ${formatMetrics(currentTurn.metrics)}

Score technicalScore, communicationScore, confidenceScore each 0-10 (or null where not applicable, per the coding rule above). Write positives/concerns as short factual observations (this is what becomes the "live notes" feature — keep each entry ONE short phrase, e.g. "Explained time complexity clearly", not a paragraph).

Then decide:
- FOLLOW_UP: ask a deeper question on the SAME topic (only if no follow-up used yet on this question)
- NEXT_SECTION: move to the next question — could be same section (if askedSoFar < targetCount) or the next section in the plan
- COMPLETE: only if this was the last question of the last section (CLOSING)

If decision is FOLLOW_UP or NEXT_SECTION, you MUST also return nextSectionType, nextInputMode ("TEXT" only for CODING section, "VOICE" otherwise), and nextQuestion (phrased in your persona's voice). If COMPLETE, those three fields should be null.

Return ONLY the JSON structure.`;

  const response = await callGeminiWithRetry("Evaluate and continue.", {
    systemInstruction,
    responseMimeType: "application/json",
    responseSchema: evaluationSchema,
    temperature: 0.6,
  });

  if (!response.text) throw new Error("Gemini returned no evaluation content");
  return JSON.parse(response.text);
}

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER },
    communicationScore: { type: Type.NUMBER },
    codingScore: { type: Type.NUMBER },
    confidenceScore: { type: Type.NUMBER },
    problemSolvingScore: { type: Type.NUMBER },
    behavioralScore: { type: Type.NUMBER },
    overallFeedback: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    improvementAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "overallScore", "communicationScore", "codingScore", "confidenceScore",
    "problemSolvingScore", "behavioralScore", "overallFeedback", "strengths", "improvementAreas",
  ],
};

export async function generateFinalReport(input: FinalReportInput): Promise<FinalReport> {
  const turnsBlock = input.turns
    .map(
      (t) =>
        `[${t.sectionType}] Q: ${t.questionText}\nA: ${t.transcript}\nScores — tech: ${t.technicalScore}, comm: ${t.communicationScore}, conf: ${t.confidenceScore}`
    )
    .join("\n\n");

  const systemInstruction = `${PERSONA_VOICE[input.setup.persona]}

The mock interview for ${input.setup.targetRole} (${input.setup.skillLevel}) is complete. Here is the full transcript with per-turn scores:

${turnsBlock}

Write a final report:
- The five category scores (0-10) should be reasonable AVERAGES/weighted reads of the relevant per-turn scores (codingScore comes from CODING-section turns, behavioralScore from BEHAVIORAL turns, etc. — problemSolvingScore and overallScore are your holistic judgment across everything).
- overallFeedback: 3-4 sentences, written TO the candidate, in your persona's voice, telling the story of how the interview went — not just restating numbers.
- strengths and improvementAreas: 2-4 short, specific, actionable bullet points each.

Return ONLY the JSON structure.`;

  const response = await callGeminiWithRetry("Generate the final report.", {
    systemInstruction,
    responseMimeType: "application/json",
    responseSchema: reportSchema,
    temperature: 0.6,
  });

  if (!response.text) throw new Error("Gemini returned no report content");
  return JSON.parse(response.text);
}