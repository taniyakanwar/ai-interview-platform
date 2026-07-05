// Types mirror your Prisma schema shape as it comes over the wire.
// Keeping these in one file means the table, badges, and future
// detail page all agree on what a "Problem" looks like — change
// the backend shape once, and TypeScript will flag every place
// in the frontend that now needs updating. That's the whole
// point of typing API responses instead of using `any`.

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

// A worked example shown on the problem detail page (not used in the list, but typed for completeness)
export interface ProblemExample {
  input: string;
  output: string;
  explanation: string;
}

// One user's progress on one problem — this is the UserProblem row,
// joined and filtered server-side to "just this logged-in user"

export interface UserProgress {
  id: string;
  userId: string;
  problemId: string;
  status: "NOT_STARTED" | "ATTEMPTED" | "SOLVED";
  starred: boolean;
  confidence: number | null;
  notes: string | null;
  attemptCount: number;
  lastSolved: string | null; // ISO date string, or null if never solved
  nextRevision: string | null; // ISO date string, or null if not scheduled yet
  updatedAt: string;
}



// The full Problem object as returned by GET /api/problems and /api/problems/:slug
export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  tags: string[];
  summary: string;
  examples: ProblemExample[];
  constraints: string;
  hints: string[];
  estimatedTime: number;
  sourceUrl: string | null;
  isCurated: boolean;
  createdById: string | null;
  createdAt: string;
  // Empty array = not started yet. One item = the user's progress record.
  // We'll write a small helper later to turn this into a single status value the table can render directly.
  userProgress: UserProgress[];
}

// Shape of the raw API response before we unwrap it in the service layer
export interface ProblemsResponse {
  problems: Problem[];
}