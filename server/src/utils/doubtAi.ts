import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Shape of one past message, as we'll pull it from the DB (DoubtMessage rows)
export interface ChatTurn {
  role: "user" | "model";
  content: string;
}

// NEW: shape of an image attached to the CURRENT turn only. We never
// need this type for past turns — see the note in the controller about
// not re-sending old images.
export interface DoubtImageInput {
  buffer: Buffer;
  mimeType: string;
}

// Named alias instead of an inline generic — one part is either plain
// text, or an inline image (base64 + mimeType). A message's `parts`
// array can mix both, which is exactly how Gemini does native
// multimodal input in one request.
type ContentPart =
  | { text: string }
  | { inlineData: { data: string; mimeType: string } };

// NEW: explicit type for one Gemini "content" entry (one turn in the
// conversation). Giving this a name and using it EXPLICITLY below is
// what fixes the inference error — without it, TS locks `contents`'s
// element type to whatever shape the first assignment happens to produce
// (in our case, the text-only history.map result), and then rejects the
// later push() of a turn that includes an image part.
interface GeminiContent {
  role: "user" | "model";
  parts: ContentPart[];
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
- If the question is ambiguous, ask a brief clarifying question instead of guessing.
- If the student attaches an image of a problem (handwritten notes, a textbook question, or a screenshot), read the image carefully first, then explain what it's asking before solving it — the student may not have transcribed it correctly themselves, so your read of the image is the source of truth.`;

/**
 * Sends a doubt-solving chat turn to Gemini, including prior conversation
 * history so follow-up questions ("explain step 2 again?") have context.
 *
 * @param history - past messages in this session, oldest first (empty array for a brand new session)
 * @param newMessage - the student's latest message (may be "" if they sent an image with no caption)
 * @param problemContext - optional problem title+description, injected only
 *   on the first message of a session that was opened "from a problem"
 * @param image - optional image attached to THIS turn only (never past turns)
 */
export async function getDoubtResponse(
  history: ChatTurn[],
  newMessage: string,
  problemContext?: string,
  image?: DoubtImageInput
): Promise<string> {
  // Explicit GeminiContent[] annotation here — this is the actual fix.
  // Now TS checks EVERY element (both the mapped history entries below,
  // and the pushed current turn further down) against the same, correctly
  // wide ContentPart[] type, instead of inferring a too-narrow type from
  // just the first assignment.
  const contents: GeminiContent[] = history.map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.content }],
  }));

  // If this session was opened from a specific problem, fold that context
  // into the new message itself (only needs to happen once — after that,
  // it's already part of `history` from the first exchange).
  const questionPart = newMessage.trim()
    ? newMessage
    : "Please read the attached image and explain/solve the problem shown in it.";

  const messageText = problemContext
    ? `Context: The student is working on this problem:\n${problemContext}\n\nStudent's question: ${questionPart}`
    : questionPart;

  // Build the parts array for THIS turn. Text always goes in; the image
  // part is appended conditionally.
  const currentParts: ContentPart[] = [{ text: messageText }];

  if (image) {
    // Gemini's inlineData format wants base64-encoded bytes, not a raw
    // Buffer and not a URL. Buffer.toString("base64") is Node's built-in
    // encoder — no extra library needed. This is also why we pass the
    // raw buffer through from multer instead of the Cloudinary URL:
    // Gemini can't fetch an external URL itself here, it needs the
    // actual bytes handed to it in the request.
    currentParts.push({
      inlineData: {
        data: image.buffer.toString("base64"),
        mimeType: image.mimeType,
      },
    });
  }

  contents.push({ role: "user", parts: currentParts });

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