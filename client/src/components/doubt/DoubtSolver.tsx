import { useState, useEffect } from "react";
import { useDoubtSolver } from "@/hooks/useDoubtSolver";
import DoubtHistorySidebar from "@/components/doubt/DoubtHistorySidebar";
import DoubtChat from "@/components/doubt/DoubtChat";

export default function DoubtSolver() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const {
    sessionId,
    messages,
    history,
    isSending,
    isLoadingHistory,
    error,
    sendMessage,
    loadHistory,
    loadSession,
    startNewChat,
    deleteSession
  } = useDoubtSolver();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // NEW: adapter between DoubtChat's (text, image) call shape and
  // sendMessage's actual (text, problemId, image) shape. Without this,
  // wiring onSendMessage={sendMessage} directly would silently put the
  // image into the problemId slot — a positional-argument mismatch, not
  // something either file did "wrong" on its own.
  //
  // problemId is hardcoded to undefined here because this screen (the
  // standalone Doubt Solver page) never opens a session "from a problem"
  // — that flow, if you build it later, would come from a DIFFERENT
  // entry point (e.g. a "Ask about this problem" button inside
  // ProblemDetail.tsx), which would call sendMessage with a real
  // problemId directly, bypassing this adapter.
  function handleSendMessage(text: string, image?: File) {
    sendMessage(text, undefined, image);
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#FAF7F2]">
      <DoubtHistorySidebar
        history={history}
        activeSessionId={sessionId}
        isLoading={isLoadingHistory}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((v) => !v)}
        onSelectSession={loadSession}
        onNewChat={startNewChat}
        onDeleteSession={deleteSession} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        {error && (
          <div className="mx-8 mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 flex justify-center">
          <div className="w-full max-w-3xl">
            <DoubtChat
              messages={messages}
              isSending={isSending}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}