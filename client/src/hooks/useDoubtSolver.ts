import { useState, useCallback } from "react";
import {
  sendDoubtMessage,
  getDoubtHistory,
  getDoubtSessionById,
  DoubtMessage,
  DoubtHistoryItem,
  deleteDoubtSession as deleteDoubtSessionApi
} from "@/services/doubtService";

export function useDoubtSolver() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DoubtMessage[]>([]);
  const [history, setHistory] = useState<DoubtHistoryItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string, problemId?: string, image?: File) => {
      // NEW: image is optional 3rd param. Backend now allows text-only,
      // image-only, or both — so mirror that same rule here instead of
      // requiring text.
      setIsSending(true);
      setError(null);

      // NEW: if there's an image, build a temporary LOCAL preview URL
      // for it. URL.createObjectURL turns the in-memory File into a
      // blob: URL the <img> tag can render immediately — this is what
      // lets the student's own uploaded photo show up in the optimistic
      // bubble instantly, before Cloudinary or Gemini have even been
      // contacted. It is NOT the real Cloudinary URL — just a local
      // pointer into browser memory that only this tab can resolve.
      const optimisticImageUrl = image ? URL.createObjectURL(image) : null;

      const optimisticUserMsg: DoubtMessage = {
        id: `temp-${Date.now()}`,
        sessionId: sessionId ?? "",
        role: "user",
        content: text,
        imageUrl: optimisticImageUrl, // NEW
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUserMsg]);

      try {
        const result = await sendDoubtMessage(
          text,
          sessionId ?? undefined,
          problemId,
          image // NEW — passed straight through to the service layer
        );

        if (!sessionId) {
          setSessionId(result.sessionId);
        }

        // Swap the optimistic temp message for the real one from the
        // server. This also replaces optimisticImageUrl with the REAL
        // Cloudinary imageUrl — important, because a blob: URL only
        // lives as long as this browser tab/session. If the student
        // reloads the page or reopens this conversation later via
        // loadSession, that blob: URL would be dead; the Cloudinary URL
        // is what actually persists.
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimisticUserMsg.id),
          result.userMessage,
          result.modelMessage,
        ]);
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMsg.id));
        const message =
          (err as any)?.response?.data?.message ||
          "Failed to send message. Please try again.";
        setError(message);
      } finally {
        // NEW: release the blob URL from browser memory once we're done
        // with it, success or failure. Object URLs aren't garbage
        // collected automatically — skipping this leaks memory a little
        // more with every image sent over a long session.
        if (optimisticImageUrl) {
          URL.revokeObjectURL(optimisticImageUrl);
        }
        setIsSending(false);
      }
    },
    [sessionId]
  );

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const items = await getDoubtHistory();
      setHistory(items);
    } catch (err) {
      console.error("Failed to load doubt history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const loadSession = useCallback(async (id: string) => {
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
    setHistory((prev) => prev.filter((s) => s.id !== id));
    if (sessionId === id) {
      setSessionId(null);
      setMessages([]);
    }
    try {
      await deleteDoubtSessionApi(id);
    } catch (err) {
      console.error("Failed to delete session:", err);
      loadHistory();
    }
  }, [sessionId, loadHistory]);

  const startNewChat = useCallback(() => {
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