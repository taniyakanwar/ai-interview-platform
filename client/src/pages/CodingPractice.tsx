// CodingPractice.tsx
// Placeholder page for the Coding Practice feature.
// This will later become the "LeetCode-style" problem list + solve + track progress screen.

import ComingSoon from "../components/ComingSoon";
// Importing our reusable placeholder component from Task 1.

import { Code2 } from "lucide-react";
// Code2 is the icon we'll show for this page — represents coding/programming.

export default function CodingPractice() {
  return (
    <ComingSoon
      icon={Code2}
      title="Coding Practice"
      description="Solve curated DSA problems, track your progress, and mark important questions for revision."
    />
  );
}