// Same pattern as useProblems(), but for a SINGLE problem by slug.
// Why not just reuse useProblems() and filter client-side?
// Because that would mean downloading ALL problems just to show one —
// wasteful once you have hundreds of problems instead of 5.
// This hook calls the dedicated single-problem endpoint instead.

import { useState, useEffect } from "react";
import { getProblemBySlug } from "@/services/problemService";
import type { Problem } from "@/types/problem";

interface UseProblemResult {
  problem: Problem | null;
  isLoading: boolean;
  error: string | null;
}

export function useProblem(slug: string | undefined): UseProblemResult {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Guard: if slug is undefined (e.g. route params haven't resolved yet),
    // don't attempt a fetch — avoids calling GET /api/problems/undefined
    if (!slug) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const currentSlug = slug;

    async function fetchProblem() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProblemBySlug(currentSlug);
        if (isMounted) {
          setProblem(data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load problem. Please try again.");
          console.error("useProblem fetch error:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProblem();

    return () => {
      isMounted = false;
    };
    // Re-run this effect whenever `slug` changes — e.g. navigating from
    // /problems/two-sum directly to /problems/valid-parentheses via a "next problem" link later
  }, [slug]);

  return { problem, isLoading, error };
}