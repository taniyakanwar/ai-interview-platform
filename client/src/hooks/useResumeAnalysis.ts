import { useState, useCallback } from "react";
import {
  analyzeResume,
  getResumeHistory,
  getResumeById,
  Resume,
  ResumeHistoryItem,
} from "@/services/resumeService";

// This hook owns all state for the Resume Analyzer feature — loading flags,
// the current result, error messages, and history list. The component
// (ResumeAnalyzer.tsx) stays "dumb": it just calls these functions and
// reads this state, with zero API/axios logic of its own.
export function useResumeAnalysis() {
  const [resume, setResume] = useState<Resume | null>(null); 
  // Holds the CURRENT analysis result shown on screen (null = no result yet, show upload UI)

  const [history, setHistory] = useState<ResumeHistoryItem[]>([]); 
  // Holds the list of past analyses, for a "previous resumes" sidebar/list

  const [isAnalyzing, setIsAnalyzing] = useState(false); 
  // True while the analyze request is in flight — drives a loading spinner on the button

  const [isLoadingHistory, setIsLoadingHistory] = useState(false); 
  // Separate loading flag for history fetch, so the two don't visually conflict

  const [error, setError] = useState<string | null>(null); 
  // Holds a user-facing error message, e.g. "Failed to read the PDF..."

  const analyze = useCallback(async (file: File, targetJD?: string) => {
    // useCallback so this function reference stays stable across re-renders —
    // matters if it's ever passed down as a prop to a child component
    // (same pattern reasoning as noteIdRef stability from Day 11).
    setIsAnalyzing(true);
    setError(null); // clear any previous error before a new attempt

    try {
      const result = await analyzeResume(file, targetJD); 
      // result = the full Resume object payload from the backend (score, breakdown, suggestions, etc.)
      setResume(result); 
      // storing it triggers the component to switch from upload view -> results view
    } catch (err) {
      // err could be an axios error (network/4xx/5xx) — extract a readable message
      const message =
        (err as any)?.response?.data?.message || "Failed to analyze resume. Please try again.";
      setError(message);
    } finally {
      setIsAnalyzing(false); // runs whether it succeeded or failed
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const items = await getResumeHistory(); 
      // items = array of lightweight ResumeHistoryItem objects (no extractedText/suggestions)
      setHistory(items);
    } catch (err) {
      console.error("Failed to load resume history:", err);
      // Not setting the main `error` state here — a failed history fetch
      // shouldn't block or overwrite the main analyze flow's error messaging.
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const viewPastResume = useCallback(async (id: string) => {
    // Used when the user clicks a past entry in their history list —
    // fetches the FULL resume object (not the lightweight history version)
    // and displays it in the same results view as a fresh analysis.
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await getResumeById(id);
      setResume(result);
    } catch (err) {
      setError("Failed to load this resume analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    // Called by the "Analyze another" button — clears the current result
    // so the component re-shows the upload UI.
    setResume(null);
    setError(null);
  }, []);

  // Everything the component needs, exposed as one object —
  // same shape/convention as your useNotes hook from Day 11.
  return {
    resume,
    history,
    isAnalyzing,
    isLoadingHistory,
    error,
    analyze,
    loadHistory,
    viewPastResume,
    reset,
  };
}