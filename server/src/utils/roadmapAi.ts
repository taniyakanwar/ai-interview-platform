// src/services/roadmapAi.ts

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ---- Input shape: everything the user confirmed on the generate form ----
export interface RoadmapGenerationInput {
  targetRole: string;
  skillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  timelineWeeks: number;
  targetCompanies: string[];   // [] if left blank
  weakTopics: string[];        // pulled from Coding Practice + Resume, user-edited
}

// ---- Output shape: mirrors the Prisma models 1:1 (minus DB-only fields
// like id/roadmapId/isCompleted) so the controller can map this straight
// into nested `create` calls without reshaping anything. ----
export interface GeneratedTask {
  content: string;
  resourceUrl?: string;
}

export interface GeneratedDay {
  dayNumber: number;
  focus: string;
  tasks: GeneratedTask[];
}

export interface GeneratedWeek {
  weekNumber: number;
  theme: string;
  description: string;
  days: GeneratedDay[];
}

export interface GeneratedRoadmap {
  weeks: GeneratedWeek[];
}

// Same pattern as doubtAi.ts's SYSTEM_INSTRUCTION — the "personality" and
// hard rules live here once, rather than getting rebuilt into the prompt
// string every call.
const SYSTEM_INSTRUCTION = `You are an expert technical interview prep coach who designs structured, week-by-week study roadmaps for CS students preparing for SDE (Software Development Engineer) interviews and other tech related job roles.

Rules:
- Build a roadmap that spans EXACTLY the number of weeks requested — no more, no fewer.
- Each week must have a clear theme (a topic area, e.g. "Arrays & Two Pointers", "Trees & Recursion", "System Design Basics", "Mock Interviews & Behavioral Prep").
- Order weeks logically: foundational topics first, advanced topics later, and reserve the final 1-2 weeks for revision + mock interviews + behavioral prep regardless of role.
- Each week has 5-6 study days (not 7 — leave implicit rest, don't over-schedule the student).
- Each day has a specific focus (a sub-topic, not just repeating the week's theme) and 2-4 short, concrete, actionable tasks.
- Keep every task description to ONE short sentence. Do not write paragraphs. Example of correct length: "Solve 3 sliding window problems on arrays." Example of WRONG length: a multi-sentence explanation of why sliding window matters.
- If the student listed weak topics, make sure those topics get dedicated days early in the roadmap, not buried at the end.
- If target companies were given, bias topic emphasis toward what those companies are known to prioritize (e.g. system design weight for companies known for it), without inventing fake company-specific claims.
- Only include a resourceUrl when you are confident it is a real, well-known, generally stable resource (e.g. official docs, GeeksforGeeks, LeetCode topic tags). If unsure, omit it rather than guessing a URL.
- Do not include any text outside the JSON structure — no preamble, no markdown fences, no closing remarks.`;


// Native structured-output schema. This is what actually enforces valid,
// parseable JSON — the SYSTEM_INSTRUCTION above shapes CONTENT quality,
// this schema shapes STRUCTURE validity. Belt and suspenders.
const roadmapSchema = {
  type: Type.OBJECT,
  properties: {
    weeks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          weekNumber: { type: Type.INTEGER },
          theme: { type: Type.STRING },
          description: { type: Type.STRING },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dayNumber: { type: Type.INTEGER },
                focus: { type: Type.STRING },
                tasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      content: { type: Type.STRING },
                      resourceUrl: { type: Type.STRING },
                    },
                    required: ["content"],
                  },
                },
              },
              required: ["dayNumber", "focus", "tasks"],
            },
          },
        },
        required: ["weekNumber", "theme", "description", "days"],
      },
    },
  },
  required: ["weeks"],
};

/**
 * Generates a full multi-week prep roadmap in one call. Returns plain data
 * only — this function never touches Prisma. The controller is responsible
 * for taking this and creating the Roadmap/RoadmapWeek/RoadmapDay/RoadmapTask
 * rows, same separation of concerns as getDoubtResponse() vs. the doubt
 * controller.
 */
export async function generateRoadmap(
  input: RoadmapGenerationInput
): Promise<GeneratedRoadmap> {
  const companiesLine = input.targetCompanies.length
    ? `Target companies: ${input.targetCompanies.join(", ")}.`
    : "No specific target companies — prepare generally for product-based companies.";

  const weakTopicsLine = input.weakTopics.length
    ? `Known weak topics to prioritize early: ${input.weakTopics.join(", ")}.`
    : "No specific weak topics flagged — build a balanced, standard-order roadmap.";

  const prompt = `Generate a ${input.timelineWeeks}-week interview prep roadmap.

Target role: ${input.targetRole}
Current skill level: ${input.skillLevel}
${companiesLine}
${weakTopicsLine}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: roadmapSchema,
        // Raised well above the default — a full multi-week roadmap is a
        // genuinely large JSON payload, and a truncated response means
        // JSON.parse throws below. Gemini 2.5 Flash supports up to 65536.
        maxOutputTokens: 32768,
        // Lower temperature than a conversational feature like Doubt
        // Solver — we want a consistent, well-structured plan, not
        // creative variation between regenerations.
        temperature: 0.6,
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned no content for roadmap generation");
    }

    // With responseSchema set, Gemini should never wrap this in markdown
    // fences — but we still wrap in try/catch below in case of a truncated
    // or malformed response, rather than letting it crash the request.
    const parsed: GeneratedRoadmap = JSON.parse(response.text);
    return parsed;
  } catch (err) {
    console.error("Gemini roadmap generation failed:", err);
    // Re-throw (unlike doubtAi.ts, which swallows errors into a friendly
    // string) — a roadmap is a bigger, DB-persisted operation, so the
    // controller needs to know generation failed and respond with a
    // proper error status, not silently save a broken/empty roadmap.
    throw new Error("Failed to generate roadmap. Please try again.");
  }
}