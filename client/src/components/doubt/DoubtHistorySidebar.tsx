import { Plus, ChevronLeft, ChevronRight, MessageCircleQuestion, Trash2 } from "lucide-react";
import { DoubtHistoryItem } from "@/services/doubtService";

interface DoubtHistorySidebarProps {
  history: DoubtHistoryItem[];
  activeSessionId: string | null;
  isLoading: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

// Light-themed second sidebar (NOT dark green — that was the "two green
// blobs" bug) sitting inside the Doubt Solver page's content area, to the
// right of the main app Sidebar. Mirrors the main Sidebar's collapse
// mechanics (w-64 <-> w-16, ChevronLeft/ChevronRight) but stays visually
// distinct as "content area chrome" rather than a second nav bar.
export default function DoubtHistorySidebar({
  history,
  activeSessionId,
  isLoading,
  isCollapsed,
  onToggle,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: DoubtHistorySidebarProps) {
  return (
    <div
      className={`h-full bg-[#FAF7F2] border-r border-[#9CB68A]/30 flex flex-col flex-shrink-0 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header: icon + label + collapse toggle */}
      <div className="p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <MessageCircleQuestion size={18} className="text-[#2D3B2A] flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-serif text-sm font-semibold text-[#2D3B2A] whitespace-nowrap">
              Doubt History
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={onToggle}
            className="text-[#2D3B2A]/50 hover:text-[#2D3B2A] transition-colors"
            aria-label="Collapse history"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="px-4 pb-2 flex justify-center">
          <button
            onClick={onToggle}
            className="text-[#2D3B2A]/50 hover:text-[#2D3B2A] transition-colors"
            aria-label="Expand history"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* New chat button */}
      <div className="px-3 pb-2">
        <button
          onClick={onNewChat}
          title={isCollapsed ? "New Doubt" : undefined}
          className={`w-full flex items-center gap-2 rounded-xl text-sm font-medium py-2.5 transition-colors bg-[#2D3B2A] text-[#FAF7F2] hover:bg-[#2D3B2A]/90 ${
            isCollapsed ? "justify-center px-0" : "px-3"
          }`}
        >
          <Plus size={16} className="flex-shrink-0" />
          {!isCollapsed && "New Doubt"}
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 px-3 py-1 space-y-1 overflow-y-auto overflow-x-hidden">
        {isLoading ? (
          !isCollapsed && (
            <div className="space-y-2 px-1 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 rounded-lg bg-[#2D3B2A]/5 animate-pulse" />
              ))}
            </div>
          )
        ) : history.length === 0 ? (
          !isCollapsed && (
            <p className="text-xs text-[#2D3B2A]/40 text-center py-6 px-2">
              No past doubts yet.
            </p>
          )
        ) : (
          history.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              // group + relative: lets the delete button (absolutely
              // positioned) know to only reveal itself when THIS specific
              // row is hovered, not any row on the page.
              <div key={session.id} className="group relative">
                <button
                  onClick={() => onSelectSession(session.id)}
                  title={isCollapsed ? session.title ?? "Untitled" : undefined}
                  className={`w-full text-left rounded-xl text-sm truncate transition-all duration-200 px-3 py-2.5 ${
                    isCollapsed ? "text-center px-0" : "pr-8"
                  } ${
                    isActive
                      ? "bg-[#9CB68A]/20 text-[#2D3B2A] font-medium"
                      : "text-[#2D3B2A]/60 hover:bg-[#2D3B2A]/5 hover:text-[#2D3B2A]"
                  }`}
                >
                  {isCollapsed ? "•" : session.title ?? "Untitled"}
                </button>

                {!isCollapsed && (
                  <button
                    onClick={(e) => {
                      // Stop the click from bubbling up to the button
                      // underneath, which would also fire onSelectSession —
                      // without this, clicking delete would open the chat
                      // AND delete it at the same time.
                      e.stopPropagation();
                      if (confirm("Delete this doubt conversation?")) {
                        onDeleteSession(session.id);
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-[#2D3B2A]/40 hover:text-red-600 transition-opacity"
                    aria-label="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}