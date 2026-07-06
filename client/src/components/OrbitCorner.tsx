// client/src/components/OrbitCorner.tsx
// Decorative orbiting icons for the Landing page's bottom-left corner.
// 6 icons (one per core NooK feature) revolve around an invisible center point,
// like planets orbiting a sun that never appears.

import { Code2, MessageSquare, FileText, Mic, Map, BookOpen } from "lucide-react";

// Each icon + its background color, matching a NooK feature
const orbitIcons = [
  { Icon: Code2, bg: "#2D3B2A" },         // Coding Practice
  { Icon: MessageSquare, bg: "#9CB68A" }, // AI Doubt Solver
  { Icon: FileText, bg: "#2D3B2A" },      // Resume Analyzer
  { Icon: Mic, bg: "#9CB68A" },           // Interview Simulator
  { Icon: Map, bg: "#2D3B2A" },           // Roadmap Generator
  { Icon: BookOpen, bg: "#9CB68A" },      // Notes
];

// How far each icon sits from the invisible center point, in pixels (doubled from 160)
const ORBIT_RADIUS = 320;

// Size of each icon circle, in pixels (doubled from 80)
const ICON_SIZE = 160;

export default function OrbitCorner() {
  return (
    // Positioned so the invisible center sits just off the bottom-left corner —
    // container is sized to comfortably fit the bigger orbit + icons without clipping
    <div
      className="fixed bottom-[-280px] left-[-280px] w-[640px] h-[640px] pointer-events-none z-0"
      aria-hidden="true" // decorative only, hidden from screen readers
    >
      {orbitIcons.map(({ Icon, bg }, index) => {
        // Spread icons evenly around the circle: 360° / 6 icons = 60° apart
        const angle = (360 / orbitIcons.length) * index;

        return (
          <div
            key={index}
            className="orbit-item flex items-center justify-center rounded-full shadow-md"
            style={{
              width: ICON_SIZE,
              height: ICON_SIZE,
              backgroundColor: bg,
              // These CSS custom properties feed into the @keyframes in index.css —
              // each icon gets a different starting angle so they're spaced around the circle
              ["--start-angle" as any]: `${angle}deg`,
              ["--orbit-radius" as any]: `${ORBIT_RADIUS}px`,
            }}
          >
            <Icon size={64} color="#FAF7F2" />
          </div>
        );
      })}
    </div>
  );
}