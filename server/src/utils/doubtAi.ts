import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Shape of one past message, as we'll pull it from the DB (DoubtMessage rows)
export interface ChatTurn {
  role: "user" | "model";
  content: string;
}

// The "personality" of the tutor — set once here so every message in every
// session gets the same behavior, instead of re-writing tone instructions
// into every prompt by hand.
const SYSTEM_INSTRUCTION = `You are a patient tutor, encouraging CS/DSA tutor helping a student who is preparing for SDE interviews. Besides this you can also answers or can make user understand the things which is related to overall and every topics even if it out of coding tech realted questions.

Rules:
- Explain step-by-step. Break the reasoning into small, clear steps rather than jumping to the final answer.
- Use simple language and analogies where it helps understanding, especially for tricky concepts.
- If solving a coding problem, explain the *approach* and *why* it works before showing code.
- Keep responses focused — don't over-explain things the student didn't ask about.
- If the question is ambiguous, ask a brief clarifying question instead of guessing.`;

/**
 * Sends a doubt-solving chat turn to Gemini, including prior conversation
 * history so follow-up questions ("explain step 2 again?") have context.
 *
 * @param history - past messages in this session, oldest first (empty array for a brand new session)
 * @param newMessage - the student's latest message
 * @param problemContext - optional problem title+description, injected only
 *   on the first message of a session that was opened "from a problem"
 */
export async function getDoubtResponse(
  history: ChatTurn[],
  newMessage: string,
  problemContext?: string
): Promise<string> {
  // Gemini expects alternating {role, parts} objects — this is just a
  // straight reshape of our DB rows into that format.
  const contents = history.map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.content }],
  }));

  // If this session was opened from a specific problem, fold that context
  // into the new message itself (only needs to happen once — after that,
  // it's already part of `history` from the first exchange).
  const messageText = problemContext
    ? `Context: The student is working on this problem:\n${problemContext}\n\nStudent's question: ${newMessage}`
    : newMessage;

  contents.push({ role: "user", parts: [{ text: messageText }] });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    if (!response.text) {
      console.error("Gemini returned no text content for doubt response");
      return "Sorry, I couldn't generate a response right now. Please try rephrasing your question.";
    }

    return response.text;
  } catch (err) {
    console.error("Gemini doubt response failed:", err);
    return "Something went wrong reaching the AI tutor. Please try again in a moment.";
  }
}