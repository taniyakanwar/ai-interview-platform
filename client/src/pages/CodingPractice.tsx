// client/src/pages/CodingPractice.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProblems } from "@/hooks/useProblems";
import { updateProgress } from "@/services/problemService";
import type { Problem } from "@/types/problem";
import { Star, Plus } from "lucide-react";
import AddProblemModal from "@/components/AddProblemModal";

function getStatus(problem: Problem): "NOT_STARTED" | "ATTEMPTED" | "SOLVED" {
  if (problem.userProgress.length === 0) return "NOT_STARTED";
  return problem.userProgress[0].status;
}

function getStarred(problem: Problem): boolean {
  if (problem.userProgress.length === 0) return false;
  return problem.userProgress[0].starred;
}

// Defines the cycle order: clicking status always moves to the "next" one in this list, looping back to the start after SOLVED
const statusCycle: Array<"NOT_STARTED" | "ATTEMPTED" | "SOLVED"> = [
  "NOT_STARTED",
  "ATTEMPTED",
  "SOLVED",
];

const statusIndicator: Record<string, { icon: string; label: string }> = {
  NOT_STARTED: { icon: "⚪", label: "Not started" },
  ATTEMPTED: { icon: "🟡", label: "Attempted" },
  SOLVED: { icon: "✅", label: "Solved" },
};

const difficultyStyle: Record<string, string> = {
  EASY: "bg-[#9CB68A] text-[#2D3B2A]",
  MEDIUM: "bg-amber-200 text-amber-900",
  HARD: "bg-red-200 text-red-900",
};

export default function CodingPractice() {
  const { problems, isLoading, error, setProblems } = useProblems();
  const navigate = useNavigate();

  // NEW — controls whether the Add Problem modal is visible
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper that updates ONE problem's userProgress in local state,
  // without touching any other problem in the array.
  // This is what makes the star/status change feel instant.
  function patchLocalProgress(
    problemId: string,
    updates: { starred?: boolean; status?: "NOT_STARTED" | "ATTEMPTED" | "SOLVED" }
  ) {
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id !== problemId) return p; // leave every other problem untouched

        const existing = p.userProgress[0];
        const merged = {
          starred: existing?.starred ?? false,
          status: existing?.status ?? "NOT_STARTED",
          ...updates,
        };

        return { ...p, userProgress: [merged as Problem["userProgress"][0]] };
      })
    );
  }

  // Handles star click
  async function handleToggleStar(e: React.MouseEvent, problem: Problem) {
    e.stopPropagation();
    const currentlyStarred = getStarred(problem);
    const newStarred = !currentlyStarred;

    patchLocalProgress(problem.id, { starred: newStarred });

    try {
      await updateProgress(problem.id, { starred: newStarred });
    } catch (err) {
      console.error("Failed to update starred status:", err);
      patchLocalProgress(problem.id, { starred: currentlyStarred });
    }
  }

  // Handles status click (cycles to next status)
  async function handleCycleStatus(e: React.MouseEvent, problem: Problem) {
    e.stopPropagation();
    const currentStatus = getStatus(problem);
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

    patchLocalProgress(problem.id, { status: nextStatus });

    try {
      await updateProgress(problem.id, { status: nextStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
      patchLocalProgress(problem.id, { status: currentStatus });
    }
  }

  // NEW — called by the modal after a problem is successfully created.
  // We just append it to the existing array — no need to refetch everything from the server.
  // Called by the modal after a problem is successfully created.
// The backend doesn't return a userProgress array for brand-new problems
// (since no progress exists yet), so we manually attach an empty one here —
// this keeps every problem object in state consistently shaped,
// which is what getStatus/getStarred expect.
function handleProblemCreated(newProblem: Problem) {
  const safeProblem: Problem = {
    ...newProblem,
    userProgress: newProblem.userProgress ?? [],
  };
  setProblems((prev) => [...prev, safeProblem]);
}

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[#2D3B2A]/60 font-['Plus_Jakarta_Sans']">
        Loading problems...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 font-['Plus_Jakarta_Sans']">
        {error}
      </div>
    );
  }

  // CHANGED — empty state now also shows the Add Problem button,
  // so a brand-new user with zero problems can still add their first one
  if (problems.length === 0) {
    return (
      <div className="p-8 bg-[#FAF7F2] min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-['Fraunces'] text-[#2D3B2A]">
            Coding Practice
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#2D3B2A] text-[#FAF7F2] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#2D3B2A]/90 transition-colors"
          >
            <Plus size={16} />
            Add Problem
          </button>
        </div>

        <div className="text-center text-[#2D3B2A]/60 font-['Plus_Jakarta_Sans'] mt-12">
          No problems yet. Add your first one!
        </div>

        {isModalOpen && (
          <AddProblemModal
            onClose={() => setIsModalOpen(false)}
            onProblemCreated={handleProblemCreated}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#FAF7F2] min-h-screen">
      {/* CHANGED — header now includes the Add Problem button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-['Fraunces'] text-[#2D3B2A]">
          Coding Practice
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#2D3B2A] text-[#FAF7F2] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#2D3B2A]/90 transition-colors"
        >
          <Plus size={16} />
          Add Problem
        </button>
      </div>

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
                <td
                  className="py-3 px-2 text-lg cursor-pointer select-none"
                  title={`${statusIndicator[status].label} (click to change)`}
                  onClick={(e) => handleCycleStatus(e, problem)}
                >
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
                <td
                  className="py-3 px-2 text-center cursor-pointer"
                  onClick={(e) => handleToggleStar(e, problem)}
                >
                  <Star
                    size={16}
                    className={
                      starred
                        ? "fill-[#9CB68A] text-[#9CB68A] inline"
                        : "text-[#2D3B2A]/20 inline hover:text-[#9CB68A]/50"
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* NEW — modal renders on top when isModalOpen is true */}
      {isModalOpen && (
        <AddProblemModal
          onClose={() => setIsModalOpen(false)}
          onProblemCreated={handleProblemCreated}
        />
      )}
    </div>
  );
}