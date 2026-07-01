// Notes.tsx
// Placeholder page for the Notes section.
// This will later become a markdown editor for storing notes on DSA, SQL, OS, etc.

import ComingSoon from "../components/ComingSoon";
import { NotebookPen } from "lucide-react";
// A notebook-with-pen icon — fits a notes-taking feature.

export default function Notes() {
  return (
    <ComingSoon
      icon={NotebookPen}
      title="Notes"
      description="Write and organize markdown notes for DSA, SQL, OS, and every topic you're revising."
    />
  );
}