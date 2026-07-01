// RoadmapGenerator.tsx
// Placeholder page for the Roadmap Generator feature.
// This will later let users input a target role, and the AI generates
// a personalized prep roadmap.

import ComingSoon from "../components/ComingSoon";
import { Map } from "lucide-react";
// A map icon — fits the idea of a "prep roadmap/journey".

export default function RoadmapGenerator() {
  return (
    <ComingSoon
      icon={Map}
      title="Roadmap Generator"
      description="Tell us your target role, and get a personalized, AI-generated preparation roadmap."
    />
  );
}