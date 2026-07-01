// AIDoubtSolver.tsx
// Placeholder page for the AI Doubt Solver feature.
// This will later become a chat-based interface where users paste code/questions
// and the AI explains logic, dry-runs code, or clarifies concepts.

import ComingSoon from "../components/ComingSoon";
import { MessageCircleQuestion } from "lucide-react";
// A speech-bubble-with-question-mark icon — fits a "doubt solving chat" feature.

export default function AIDoubtSolver() {
  return (
    <ComingSoon
      icon={MessageCircleQuestion}
      title="AI Doubt Solver"
      description="Ask questions, get code explained line-by-line, and clear your doubts with an AI tutor."
    />
  );
}