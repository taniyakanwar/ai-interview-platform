import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AiSuggestion {
  issue: string;
  suggestion: string;
}

export async function generateResumeSuggestions(
  resumeText: string,
  targetJD?: string
): Promise<AiSuggestion[]> {
  // Prompt branches depending on whether a target job description was
  // provided — with a JD, Gemini is asked to weigh relevance/alignment
  // to that specific role, not just generic resume best practices.
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        // Structured output — forces Gemini to only ever emit JSON matching
        // this exact shape, instead of prompting "please reply in JSON" and
        // hoping it doesn't add stray text or markdown fences around it.
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
      },
    });

    if (!response.text) {
      // response.text is typed string | undefined — Gemini could return no
      // text content (e.g. blocked by a safety filter, or an edge-case empty
      // response). Treat it like any other failure: no suggestions, not a crash.
      console.error("Gemini returned no text content");
      return [];
    }

    return JSON.parse(response.text) as AiSuggestion[];
  } catch (err) {
    // Swallow the error here rather than letting it propagate — the controller
    // decides what "AI suggestions unavailable" looks like to the user.
    // The ATS score (rule-based, no external dependency) should never be
    // blocked or delayed by Gemini being down, rate-limited, or slow.
    console.error("Gemini suggestion generation failed:", err);
    return [];
  }
}