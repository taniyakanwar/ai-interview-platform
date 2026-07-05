// client/src/pages/CodingPractice.tsx
//
// This page's ONLY job: render problems as a table.
// All the "how do we get the data" complexity is hidden inside useProblems() —
// this component just asks for data and describes what to do with each state.

import { useNavigate } from "react-router-dom";
import { useProblems } from "@/hooks/useProblems";
import type { Problem } from "@/types/problem";
import { Star } from "lucide-react";

// Small helper: turns userProgress[] (0 or 1 items) into a single readable status.
function getStatus(problem: Problem): "NOT_STARTED" | "ATTEMPTED" | "SOLVED" {
  if (problem.userProgress.length === 0) return "NOT_STARTED";
  return problem.userProgress[0].status;
}

function getStarred(problem: Problem): boolean {
  if (problem.userProgress.length === 0) return false;
  return problem.userProgress[0].starred;
}

// Maps each status to a small visual indicator.
const statusIndicator: Record<string, { icon: string; label: string }> = {
  NOT_STARTED: { icon: "⚪", label: "Not started" },
  ATTEMPTED: { icon: "🟡", label: "Attempted" },
  SOLVED: { icon: "✅", label: "Solved" },
};

// Maps each difficulty to your brand palette.
const difficultyStyle: Record<string, string> = {
  EASY: "bg-[#9CB68A] text-[#2D3B2A]",
  MEDIUM: "bg-amber-200 text-amber-900",
  HARD: "bg-red-200 text-red-900",
};

export default function CodingPractice() {
  const { problems, isLoading, error } = useProblems();
  const navigate = useNavigate(); // lets us change routes programmatically, e.g. on row click

  // Case 1: loading state
  if (isLoading) {
    return (
      <div className="p-8 text-center text-[#2D3B2A]/60 font-['Plus_Jakarta_Sans']">
        Loading problems...
      </div>
    );
  }

  // Case 2: error state
  if (error) {
    return (
      <div className="p-8 text-center text-red-600 font-['Plus_Jakarta_Sans']">
        {error}
      </div>
    );
  }

  // Case 3: success, but zero problems
  if (problems.length === 0) {
    return (
      <div className="p-8 text-center text-[#2D3B2A]/60 font-['Plus_Jakarta_Sans']">
        No problems yet. Check back soon!
      </div>
    );
  }

  // Case 4: the actual table
  return (
    <div className="p-6 bg-[#FAF7F2] min-h-screen">
      <h1 className="text-3xl font-['Fraunces'] text-[#2D3B2A] mb-6">
        Coding Practice
      </h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#2D3B2A]/10 text-left text-sm text-[#2D3B2A]/60 font-['Plus_Jakarta_Sans']">
            <th className="py-3 px-2 w-10"></th>
            <th className="py-3 px-2">Title</th>
            <th className="py-3 px-2">Difficulty</th>
            <th className="py-3 px-2">Tags</th>
            <th className="py-3 px-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem) => {
            const status = getStatus(problem);
            const starred = getStarred(problem);

            return (
              <tr
                key={problem.id}
                className="border-b border-[#2D3B2A]/5 hover:bg-[#9CB68A]/10 transition-colors cursor-pointer"
                onClick={() => navigate(`/problems/${problem.slug}`)}
              >
                <td className="py-3 px-2 text-lg" title={statusIndicator[status].label}>
                  {statusIndicator[status].icon}
                </td>
                <td className="py-3 px-2 font-['Plus_Jakarta_Sans'] font-medium text-[#2D3B2A]">
                  {problem.title}
                </td>
                <td className="py-3 px-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyStyle[problem.difficulty]}`}
                  >
                    {problem.difficulty}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex gap-1 flex-wrap">
                    {problem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-[#2D3B2A]/5 text-[#2D3B2A]/70 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  {starred && <Star size={16} className="fill-[#9CB68A] text-[#9CB68A] inline" />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}