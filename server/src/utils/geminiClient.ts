// geminiClient.ts
// Single shared Gemini client + retry wrapper, used by roadmapAi.ts,
// resumeAi.ts, and interviewAi.ts. Extracted after the resumeAi.ts
// mixup (Day 14 commit accidentally overwrote it with roadmap code) —
// having ONE copy of this logic means a future copy-paste mistake
// between AI files can no longer also duplicate/diverge this function.

import { GoogleGenAI } from "@google/genai";

// One shared instance instead of each file creating its own — same
// API key, no reason to construct this three times.
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Wraps a raw Gemini call with a single automatic retry, but ONLY for
// genuinely transient network failures (DNS blip, connection reset) —
// not for bad requests, which would fail identically a second time.
// Originally added to fix ENOTFOUND/ECONNRESET failures on longer
// (9+ week) Roadmap generations; applies equally to Resume and
// Interview calls since it's the same underlying fetch to Gemini.
export async function callGeminiWithRetry(
  prompt: string,
  config: any,
  attempt = 1
): Promise<any> {
  try {
    return await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config,
    });
  } catch (err) {
    const cause = (err as any)?.cause;
    const isNetworkError =
      err instanceof Error &&
      (err.message.includes("fetch failed") ||
        cause?.code === "ENOTFOUND" ||
        cause?.code === "ECONNRESET");

    if (isNetworkError && attempt < 2) {
      console.warn(`Gemini network error, retrying (attempt ${attempt + 1})...`);
      await new Promise((r) => setTimeout(r, 1500));
      return callGeminiWithRetry(prompt, config, attempt + 1);
    }
    throw err;
  }
}