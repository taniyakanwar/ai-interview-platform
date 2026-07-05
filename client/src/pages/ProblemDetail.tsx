// This page reads the :slug from the URL, fetches that one problem,
// and renders it: title, difficulty, summary, examples, constraints, and hints.
// Hints are revealed progressively — not dumped all at once — since the whole
// point of a hint is that you earn it by trying first.

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProblem } from "@/hooks/useProblem";
import { ArrowLeft, Lightbulb } from "lucide-react";

const difficultyStyle: Record<string, string> = {
  EASY: "bg-[#9CB68A] text-[#2D3B2A]",
  MEDIUM: "bg-amber-200 text-amber-900",
  HARD: "bg-red-200 text-red-900",
};

export default function ProblemDetail() {
  // useParams() reads whatever matched :slug in the route path.
  // Typed as { slug: string } here since App.tsx guarantees this component
  // only ever renders on a URL that matched "/problems/:slug"
  const { slug } = useParams<{ slug: string }>();
  const { problem, isLoading, error } = useProblem(slug);

  // Tracks how many hints are currently visible — starts at 0 (none shown)
  const [visibleHints, setVisibleHints] = useState(0);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[#2D3B2A]/60 font-['Plus_Jakarta_Sans']">
        Loading problem...
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="p-8 text-center text-red-600 font-['Plus_Jakarta_Sans']">
        {error || "Problem not found."}
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#FAF7F2] min-h-screen font-['Plus_Jakarta_Sans']">
      {/* Back link — takes you back to the list, per Day 8's table */}
      <Link
        to="/coding-practice"
        className="flex items-center gap-1 text-sm text-[#2D3B2A]/60 hover:text-[#2D3B2A] mb-4"
      >
        <ArrowLeft size={16} />
        Back to Problems
      </Link>

      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-3xl font-['Fraunces'] text-[#2D3B2A]">
          {problem.title}
        </h1>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyStyle[problem.difficulty]}`}
        >
          {problem.difficulty}
        </span>
      </div>

      <div className="flex gap-1 flex-wrap mb-6">
        {problem.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-[#2D3B2A]/5 text-[#2D3B2A]/70 px-2 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="text-[#2D3B2A] mb-6 leading-relaxed">{problem.summary}</p>

      {/* Examples */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#2D3B2A] mb-2">Examples</h2>
        {problem.examples.map((example, i) => (
          <div
            key={i}
            className="bg-white/60 border border-[#2D3B2A]/10 rounded-lg p-4 mb-2 font-mono text-sm"
          >
            <p><span className="text-[#2D3B2A]/60">Input:</span> {example.input}</p>
            <p><span className="text-[#2D3B2A]/60">Output:</span> {example.output}</p>
            <p className="font-sans text-[#2D3B2A]/70 mt-1">{example.explanation}</p>
          </div>
        ))}
      </div>

      {/* Constraints */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#2D3B2A] mb-2">Constraints</h2>
        <p className="font-mono text-sm text-[#2D3B2A]/80">{problem.constraints}</p>
      </div>

      {/* Progressive hints — click to reveal one at a time */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#2D3B2A] mb-2 flex items-center gap-2">
          <Lightbulb size={18} />
          Hints
        </h2>
        {problem.hints.slice(0, visibleHints).map((hint, i) => (
          <p key={i} className="text-[#2D3B2A]/80 mb-2">
            {i + 1}. {hint}
          </p>
        ))}
        {visibleHints < problem.hints.length && (
          <button
            onClick={() => setVisibleHints((v) => v + 1)}
            className="text-sm text-[#9CB68A] hover:text-[#2D3B2A] font-medium underline"
          >
            Reveal hint {visibleHints + 1} of {problem.hints.length}
          </button>
        )}
      </div>
    </div>
  );
}