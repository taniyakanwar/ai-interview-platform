// src/services/roadmapAi.ts

import { Type } from "@google/genai";
import { callGeminiWithRetry } from "./geminiClient"; // ai no longer needed directly here

export interface RoadmapGenerationInput {
  targetRole: string;
  skillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  timelineWeeks: number;
  targetCompanies: string[];
  weakTopics: string[];
}

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
    // CHANGED: now routes through callGeminiWithRetry instead of calling
    // ai.models.generateContent directly — this is what actually restores
    // the network-retry protection the extraction was supposed to preserve.
    const response = await callGeminiWithRetry(prompt, {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: roadmapSchema,
      maxOutputTokens: 32768,
      temperature: 0.6,
    });

    if (!response.text) {
      throw new Error("Gemini returned no content for roadmap generation");
    }

    const parsed: GeneratedRoadmap = JSON.parse(response.text);
    return parsed;
  } catch (err) {
    console.error("Gemini roadmap generation failed:", err);
    throw new Error("Failed to generate roadmap. Please try again.");
  }
}