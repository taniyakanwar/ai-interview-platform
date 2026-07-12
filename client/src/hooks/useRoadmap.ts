// useRoadmap.ts
import { useState, useCallback } from "react";
import {
  getRoadmapSuggestions,
  generateRoadmap as generateRoadmapApi,
  getActiveRoadmap,
  getRoadmapHistory,
  activateRoadmap as activateRoadmapApi,
  toggleRoadmapTask,
  deleteRoadmap as deleteRoadmapApi,
} from "@/services/roadmapService";
import {
  Roadmap,
  RoadmapHistoryItem,
  RoadmapGenerateInput,
} from "@/types/roadmap.types";

// Small immutable-update helper, scoped to this file since nothing else
// needs to reach into a roadmap's nested tree. Walks weeks -> days ->
// tasks and returns a NEW roadmap object with just one task's
// isCompleted/completedAt flipped — everything else is the same
// reference, so React only re-renders the branch that actually changed.
function flipTaskInRoadmap(roadmap: Roadmap, taskId: string): Roadmap {
  return {
    ...roadmap,
    weeks: roadmap.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({
        ...day,
        tasks: day.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                isCompleted: !task.isCompleted,
                completedAt: !task.isCompleted ? new Date().toISOString() : null,
              }
            : task
        ),
      })),
    })),
  };
}

export function useRoadmap() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [history, setHistory] = useState<RoadmapHistoryItem[]>([]);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);

  // Separate loading flags per action — same reasoning as
  // useDoubtSolver's isSending/isLoadingHistory/isLoadingSession split:
  // generating a roadmap and switching the active one are different UI
  // moments (e.g. show a spinner on the generate button specifically,
  // not the whole page) and shouldn't share one flag.
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingActive, setIsLoadingActive] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    setIsLoadingSuggestions(true);
    try {
      const topics = await getRoadmapSuggestions();
      setSuggestedTopics(topics);
    } catch (err) {
      // Non-fatal — the generate form still works with an empty/manual
      // topic list, so we log rather than surface a blocking error.
      console.error("Failed to load suggestions:", err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const loadActiveRoadmap = useCallback(async () => {
    setIsLoadingActive(true);
    setError(null);
    try {
      const active = await getActiveRoadmap();
      setRoadmap(active); // null is a valid, expected result — "no roadmap yet"
    } catch (err) {
      setError("Failed to load your roadmap.");
    } finally {
      setIsLoadingActive(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const items = await getRoadmapHistory();
      setHistory(items);
    } catch (err) {
      console.error("Failed to load roadmap history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // No optimistic UI here on purpose (unlike sendMessage/toggleTask below)
  // — generation takes a real few seconds (Gemini call + DB write), and
  // there's nothing sensible to fake-render in the meantime. The
  // generate button should just show a loading state instead.
  const generate = useCallback(async (input: RoadmapGenerateInput) => {
    setIsGenerating(true);
    setError(null);
    try {
      const newRoadmap = await generateRoadmapApi(input);
      setRoadmap(newRoadmap);
      // Refresh history in the background so the new roadmap shows up
      // there too, without blocking on it — the main view already has
      // what it needs from newRoadmap above.
      loadHistory();
      return newRoadmap;
    } catch (err) {
      const message =
        (err as any)?.response?.data?.message ||
        "Failed to generate roadmap. Please try again.";
      setError(message);
      throw err; // re-throw so the form component can decide its own UI reaction (e.g. keep inputs filled)
    } finally {
      setIsGenerating(false);
    }
  }, [loadHistory]);

  const switchActive = useCallback(async (roadmapId: string) => {
    // Optimistic here IS reasonable — flip isActive locally in the
    // history list immediately, since it's just a boolean flag flip,
    // cheap to roll back if the request fails.
    setHistory((prev) =>
      prev.map((r) => ({ ...r, isActive: r.id === roadmapId }))
    );
    try {
      const activated = await activateRoadmapApi(roadmapId);
      setRoadmap(activated);
    } catch (err) {
      console.error("Failed to switch roadmap:", err);
      loadHistory(); // rollback by refetching real state
    }
  }, [loadHistory]);

  const toggleTask = useCallback(
    async (taskId: string) => {
      if (!roadmap) return;

      // Flip immediately in the UI...
      setRoadmap((prev) => (prev ? flipTaskInRoadmap(prev, taskId) : prev));

      try {
        await toggleRoadmapTask(taskId);
        // Server response is intentionally ignored on success — the
        // optimistic flip already matches what the server did (a simple
        // boolean toggle can't disagree with itself), so re-setting
        // state here would just be a redundant render.
      } catch (err) {
        console.error("Failed to toggle task:", err);
        // ...and flip back on failure. Calling flipTaskInRoadmap AGAIN
        // is correct here specifically because it's a toggle — flipping
        // twice returns to the original state. This wouldn't work for
        // an action that sets an absolute value instead of toggling one.
        setRoadmap((prev) => (prev ? flipTaskInRoadmap(prev, taskId) : prev));
        setError("Failed to update task. Please try again.");
      }
    },
    [roadmap]
  );

  const removeRoadmap = useCallback(async (roadmapId: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== roadmapId));
    if (roadmap?.id === roadmapId) {
      setRoadmap(null); // deleted the active one — see the note we flagged in the controller
    }
    try {
      await deleteRoadmapApi(roadmapId);
    } catch (err) {
      console.error("Failed to delete roadmap:", err);
      loadHistory();
      loadActiveRoadmap();
    }
  }, [roadmap, loadHistory, loadActiveRoadmap]);

  return {
    roadmap,
    history,
    suggestedTopics,
    isGenerating,
    isLoadingActive,
    isLoadingHistory,
    isLoadingSuggestions,
    error,
    loadSuggestions,
    loadActiveRoadmap,
    loadHistory,
    generate,
    switchActive,
    toggleTask,
    removeRoadmap,
  };
}