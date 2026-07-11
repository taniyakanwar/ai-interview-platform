import { useState, useCallback } from "react";
import {
  sendDoubtMessage,
  getDoubtHistory,
  getDoubtSessionById,
  DoubtMessage,
  DoubtHistoryItem,
  deleteDoubtSession as deleteDoubtSessionApi
} from "@/services/doubtService";

// This hook owns all state for the AI Doubt Solver — the active
// conversation, the sidebar history list, and loading/error flags.
// The components (DoubtChat, DoubtHistorySidebar) stay "dumb": they just
// call these functions and render this state, same convention as useResumeAnalysis.
export function useDoubtSolver() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  // null = no active conversation yet (fresh chat, matches lazy-creation —
  // no session exists in the DB until the first message is actually sent)

  const [messages, setMessages] = useState<DoubtMessage[]>([]);
  // The full conversation currently shown on screen, oldest first

  const [history, setHistory] = useState<DoubtHistoryItem[]>([]);
  // Sidebar list of past sessions (titles only)

  const [isSending, setIsSending] = useState(false);
  // True while waiting for Gemini's reply — drives a "thinking..." bubble

  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  // Separate flags, same reasoning as resume hook — don't let unrelated
  // loading states visually conflict with each other

  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string, problemId?: string) => {
      setIsSending(true);
      setError(null);

      // ---- OPTIMISTIC UPDATE ----
      // Build a temporary message object and add it to `messages` RIGHT
      // NOW, before the API call even starts. This is what makes the chat
      // feel instant — the student sees their own message appear the
      // moment they hit send, not 2-3 seconds later when Gemini replies.
      // We don't have a real DB id yet, so we fake one with a timestamp —
      // it only needs to be unique for React's rendering, it gets replaced
      // by the real backend data below anyway.
      const optimisticUserMsg: DoubtMessage = {
        id: `temp-${Date.now()}`,
        sessionId: sessionId ?? "",
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUserMsg]);

      try {
        const result = await sendDoubtMessage(
          text,
          sessionId ?? undefined, // undefined on the very first message — triggers Case 2 (new session) on the backend
          problemId
        );

        // If this was a brand new session, we now know its real ID for
        // the first time — store it so the NEXT message in this
        // conversation gets sent as a follow-up (Case 1 on the backend).
        if (!sessionId) {
          setSessionId(result.sessionId);
        }

        // Replace the optimistic temp message + append Gemini's real
        // reply. We drop the fake temp message and use the REAL one from
        // the server (result.userMessage) so the id/timestamp are accurate
        // going forward — important if the user later reloads this session
        // via loadSession, where ids must match the DB exactly.
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimisticUserMsg.id),
          result.userMessage,
          result.modelMessage,
        ]);
      } catch (err) {
        // Roll back the optimistic message on failure — don't leave a
        // message on screen that was never actually saved/answered.
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMsg.id));
        const message =
          (err as any)?.response?.data?.message ||
          "Failed to send message. Please try again.";
        setError(message);
      } finally {
        setIsSending(false);
      }
    },
    [sessionId]
    // Depends on sessionId — this function needs the LATEST sessionId
    // every time it's called, unlike the resume hook's callbacks which
    // had no such dependency. (React re-creates this function whenever
    // sessionId changes, which is correct and intentional here.)
  );

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const items = await getDoubtHistory();
      setHistory(items);
    } catch (err) {
      console.error("Failed to load doubt history:", err);
      // Same reasoning as resume hook — a failed sidebar fetch shouldn't
      // block or overwrite the active chat's own error messaging.
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const loadSession = useCallback(async (id: string) => {
    // Called when the student clicks a past conversation in the sidebar —
    // loads the FULL thread and swaps it in as the active conversation.
    setIsLoadingSession(true);
    setError(null);
    try {
      const session = await getDoubtSessionById(id);
      setSessionId(session.id);
      setMessages(session.messages);
    } catch (err) {
      setError("Failed to load this conversation.");
    } finally {
      setIsLoadingSession(false);
    }
  }, []);

  const deleteSession = useCallback(async (id: string) => {
  // Optimistic removal from the sidebar list immediately
  setHistory((prev) => prev.filter((s) => s.id !== id));
  // If the deleted session was the currently open one, clear the chat too
  if (sessionId === id) {
    setSessionId(null);
    setMessages([]);
  }
  try {
    await deleteDoubtSessionApi(id);
  } catch (err) {
    console.error("Failed to delete session:", err);
    // Roll back by re-fetching the real list from the server
    loadHistory();
  }
}, [sessionId, loadHistory]);

  const startNewChat = useCallback(() => {
    // Called by a "New chat" button — clears the active conversation so
    // the next sendMessage() call starts a fresh session (sessionId back
    // to null triggers Case 2 on the backend again).
    setSessionId(null);
    setMessages([]);
    setError(null);
  }, []);

  return {
    sessionId,
    messages,
    history,
    isSending,
    isLoadingHistory,
    isLoadingSession,
    error,
    sendMessage,
    loadHistory,
    loadSession,
    startNewChat,
    deleteSession
  };
}