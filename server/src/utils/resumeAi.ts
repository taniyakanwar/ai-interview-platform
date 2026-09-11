import { Type } from "@google/genai";
import { callGeminiWithRetry } from "./geminiClient"; // ai no longer needed directly here

export interface AiSuggestion {
  issue: string;
  suggestion: string;
}

export async function generateResumeSuggestions(
  resumeText: string,
  targetJD?: string
): Promise<AiSuggestion[]> {
  const prompt = targetJD
    ? `You are an expert technical resume reviewer. Given this resume text and a target job description, identify the top 5-7 concrete issues and how to fix each one. Focus on wording, quantification of achievements, and relevance/alignment to the target job description.

RESUME:
${resumeText}

TARGET JOB DESCRIPTION:
${targetJD}`
    : `You are an expert technical resume reviewer. Identify the top 5-7 concrete issues in this resume and how to fix each one. Focus on wording, quantification of achievements, and clarity.

RESUME:
${resumeText}`;

  try {
    // CHANGED: routes through callGeminiWithRetry instead of calling
    // ai.models.generateContent directly — same fix as roadmapAi.ts.
    const response = await callGeminiWithRetry(prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            issue: { type: Type.STRING },
            suggestion: { type: Type.STRING },
          },
          required: ["issue", "suggestion"],
        },
      },
    });

    if (!response.text) {
      console.error("Gemini returned no text content");
      return [];
    }

    return JSON.parse(response.text) as AiSuggestion[];
  } catch (err) {
    console.error("Gemini suggestion generation failed:", err);
    return [];
  }
}