// ResumeAnalyzer.tsx
// Placeholder page for the Resume Analyzer feature.
// This will later let users upload a PDF resume and get an ATS score + missing skills + suggestions.

import ComingSoon from "../components/ComingSoon";
import { FileSearch } from "lucide-react";
// A "file with a magnifying glass" icon — fits resume scanning/analysis.

export default function ResumeAnalyzer() {
  return (
    <ComingSoon
      icon={FileSearch}
      title="Resume Analyzer"
      description="Upload your resume and get an ATS score, missing skills, and tailored improvement suggestions."
    />
  );
}