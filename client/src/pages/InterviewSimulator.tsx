// InterviewSimulator.tsx
// Placeholder page for the Interview Simulator feature.
// This will later become an AI interviewer that asks questions and scores
// confidence, technical quality, and communication.

import ComingSoon from "../components/ComingSoon";
import { Mic } from "lucide-react";
// A microphone icon — fits a mock-interview / speaking feature.

export default function InterviewSimulator() {
  return (
    <ComingSoon
      icon={Mic}
      title="Interview Simulator"
      description="Practice with an AI interviewer and get feedback on your confidence, technical depth, and communication."
    />
  );
}