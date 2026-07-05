// Why a custom hook instead of calling problemService directly inside the page component:
// 1. Loading/error state management is boilerplate — if we inline it in the page,
//    every future page that fetches data repeats this same pattern.
// 2. Separation of concerns: the page component's job is to RENDER,
//    this hook's job is to FETCH. Testing/reasoning about each becomes easier.
//
// Analogy: think of this hook as a dedicated shopping assistant. You (the page)
// don't go to the store yourself — you send the assistant, they come back with
// the groceries (data), or tell you the store was closed (error), and you know
// whether they've left yet (loading).

import { useState, useEffect } from "react";
import { getAllProblems } from "@/services/problemService";
import type { Problem } from "@/types/problem";

interface UseProblemsResult {
  problems: Problem[];
  isLoading: boolean;
  error: string | null;
}

export function useProblems(): UseProblemsResult {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // A flag to prevent a classic React bug: if the component unmounts
    // (user navigates away) before the fetch finishes, we don't want to
    // call setState on an unmounted component — React will warn about it,
    // and in rare cases it can cause subtle memory leaks.
    let isMounted = true;

    async function fetchProblems() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllProblems();
        if (isMounted) {
          setProblems(data);
        }
      } catch (err) {
        if (isMounted) {
          // Keep the error message generic for the UI — we don't want to
          // leak raw backend error details (like stack traces) to the user.
          setError("Failed to load problems. Please try again.");
          console.error("useProblems fetch error:", err); // full detail stays in the console for you to debug
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProblems();

    // Cleanup function — runs when the component unmounts
    return () => {
      isMounted = false;
    };
  }, []); // empty dependency array = fetch once when the component using this hook first mounts

  return { problems, isLoading, error };
}