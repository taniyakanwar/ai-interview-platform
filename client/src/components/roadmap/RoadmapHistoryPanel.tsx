// RoadmapHistoryPanel.tsx
// A collapsible utility panel for switching between saved roadmaps.
// Deliberately uses the TAN (#D9C8B4) palette, not sage/forest — so it
// reads as a secondary tool panel, never confused with the main app
// sidebar. Collapses to an icon strip, same interaction pattern as your
// main sidebar (w-64 <-> w-20), but visually its own thing.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsLeft, ChevronsRight, Trash2, Route } from "lucide-react";
import { RoadmapHistoryItem } from "@/types/roadmap.types";

interface RoadmapHistoryPanelProps {
  history: RoadmapHistoryItem[];
  onSwitch: (roadmapId: string) => void;
  onDelete: (roadmapId: string) => void;
}

export default function RoadmapHistoryPanel({ history, onSwitch, onDelete }: RoadmapHistoryPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex-shrink-0 rounded-2xl bg-[#D9C8B4]/30 border border-[#D9C8B4] h-fit sticky top-6 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-4">
        {!collapsed && (
          <span className="text-xs font-semibold uppercase tracking-wide text-[#2D3B2A]/60">
            Past roadmaps
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-[#2D3B2A]/60 hover:text-[#2D3B2A] transition-colors ml-auto"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 px-3 pb-4">
        {history.map((r) => (
          <div key={r.id} className="relative group">
            <button
              onClick={() => onSwitch(r.id)}
              className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                r.isActive ? "bg-[#2D3B2A] text-[#FAF7F2]" : "hover:bg-[#D9C8B4]/50 text-[#2D3B2A]"
              }`}
              title={collapsed ? r.targetRole : undefined}
            >
              <Route size={15} className="flex-shrink-0" />
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{r.targetRole}</p>
                  <p className={`text-[10px] ${r.isActive ? "text-[#FAF7F2]/60" : "text-[#2D3B2A]/50"}`}>
                    {r.timelineWeeks}w · {r.skillLevel.charAt(0) + r.skillLevel.slice(1).toLowerCase()}
                  </p>
                </div>
              )}
            </button>

            {!collapsed && (
              <button
                onClick={() => setConfirmDeleteId(r.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-40 group-hover:opacity-100 text-[#2D3B2A]/40 hover:text-red-600 transition-opacity"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}

        {history.length === 0 && !collapsed && (
          <p className="text-xs text-[#2D3B2A]/40 px-3 py-2">No past roadmaps yet.</p>
        )}
      </div>

      {/* Tiny inline confirm — avoids pulling in a full modal component
          just for one destructive action */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#2D3B2A]/90 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl"
          >
            <p className="text-[#FAF7F2] text-sm text-center">Delete this roadmap? This can't be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-1.5 rounded-lg bg-[#FAF7F2]/20 text-[#FAF7F2] text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}