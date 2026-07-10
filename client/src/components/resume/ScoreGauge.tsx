import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface ScoreGaugeProps {
  score: number; // 0-100, the atsScore value from the Resume object
  size?: number; // diameter in pixels, defaults to 180
}

export function ScoreGauge({ score, size = 180 }: ScoreGaugeProps) {
  // ---------- GEOMETRY SETUP ----------
  const strokeWidth = 12; 
  // thickness of the arc ring — thick enough to feel substantial, not hairline

  const radius = (size - strokeWidth) / 2; 
  // radius shrinks by half the stroke width so the ring doesn't clip outside the SVG viewBox

  const circumference = 2 * Math.PI * radius; 
  // full circle length — this is what stroke-dasharray/dashoffset math is based on

  // ---------- SCORE -> COLOR MAPPING ----------
  // Rather than one flat color regardless of score, the ring's color shifts
  // to reinforce what the number means at a glance — forest green (your primary)
  // for a strong score, sage for moderate, a warm clay tone for scores that
  // need real work. This uses your existing brand colors, not a generic
  // red/yellow/green traffic-light scheme.
  const getColor = (value: number) => {
    if (value >= 80) return "#2D3B2A"; // forest green — strong score
    if (value >= 60) return "#9CB68A"; // sage green — moderate, room to improve
    return "#C97B5A"; // warm clay — needs real attention (still within a warm palette, not alarm-red)
  };
  const color = getColor(score);

  // ---------- ANIMATED COUNT-UP + ARC FILL ----------
  const motionScore = useMotionValue(0); 
  // starts at 0 — this is the value we'll animate from 0 up to the real score

  const roundedScore = useTransform(motionScore, (v) => Math.round(v)); 
  // derived value: same as motionScore but rounded to a whole number for display,
  // since 47.3826... ticking by mid-animation would look broken, not smooth

  const displayRef = useRef<HTMLSpanElement>(null); 
  // we write the rounded number directly into this span's textContent on every
  // animation frame — cheaper than triggering a React re-render 60 times/second

  useEffect(() => {
    // Animate motionScore from its current value (0, on mount) up to the real
    // score over 1.2s, using an "easeOut" curve so it starts fast and settles
    // gently — feels like a natural reveal rather than a mechanical linear fill.
    const controls = animate(motionScore, score, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (displayRef.current) {
          displayRef.current.textContent = Math.round(latest).toString();
        }
      },
    });

    return () => controls.stop(); 
    // cleanup: if the component unmounts mid-animation (e.g. user clicks
    // "Analyze another" quickly), stop the animation instead of letting it
    // keep running against a removed DOM node.
  }, [score, motionScore]);

  // ---------- ARC DASH OFFSET (the actual "filling" visual) ----------
  // SVG circles are drawn using a dash pattern trick: stroke-dasharray sets
  // the total pattern length (= full circumference), and stroke-dashoffset
  // shifts that pattern to reveal only part of the circle — that's what
  // creates the "arc filling up" appearance as offset decreases from full to 0.
  const dashOffset = useTransform(
    roundedScore,
    (v) => circumference - (v / 100) * circumference
  );

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* -rotate-90 makes the arc start from the top (12 o'clock) instead 
            of the default 3 o'clock, matching how progress rings are 
            conventionally read left-to-right/clockwise from the top. */}

        {/* Background track — a faint full circle showing the "unfilled" 100% */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EDE8DE" 
          // a slightly darker tone than your cream background (#FAF7F2), 
          // just enough to be visible as a track without competing with the arc
          strokeWidth={strokeWidth}
        />

        {/* Foreground arc — the actual animated score fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round" 
          // rounded end-cap on the arc — softer, matches the organic feel 
          // of your brand rather than a hard technical/clinical edge
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>

      {/* Score number, centered inside the ring via absolute positioning */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          ref={displayRef}
          className="font-serif text-4xl font-semibold"
          style={{ color, fontFamily: "Fraunces, serif" }}
        >
          0
          {/* starts at "0" in the markup — immediately overwritten by the 
              animation's onUpdate callback on mount, so there's never a 
              flash of the real score appearing instantly before the animation runs */}
        </span>
        <span className="text-xs uppercase tracking-wide text-[#6B7263] mt-1">
          ATS Score
        </span>
      </div>
    </div>
  );
}