import { useState, useEffect } from "react";
import { getAllProblems } from "@/services/problemService";
import type { Problem } from "@/types/problem";

interface UseProblemsResult {
  problems: Problem[];
  isLoading: boolean;
  error: string | null;
  setProblems: React.Dispatch<React.SetStateAction<Problem[]>>; // NEW — lets pages update state directly (needed for optimistic UI updates like star/status toggles)
}

export function useProblems(): UseProblemsResult {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          setError("Failed to load problems. Please try again.");
          console.error("useProblems fetch error:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProblems();

    return () => {
      isMounted = false;
    };
  }, []);

  return { problems, isLoading, error, setProblems }; // NEW — added setProblems to the return
}