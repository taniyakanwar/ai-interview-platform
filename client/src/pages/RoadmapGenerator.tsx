// RoadmapGenerator.tsx
// Ties everything together. Full-bleed layout (no centered max-w
// container) so the accordion and history panel use the whole page
// width — this is a workspace, not a marketing page.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRoadmap } from "@/hooks/useRoadmap";
import RoadmapAccordion from "@/components/roadmap/RoadmapAccordion";
import RoadmapGenerateForm from "@/components/roadmap/RoadmapGenerateForm";
import RoadmapHistoryPanel from "@/components/roadmap/RoadmapHistoryPanel";

export default function RoadmapGenerator() {
  const {
    roadmap,
    history,
    suggestedTopics,
    isGenerating,
    isLoadingActive,
    loadActiveRoadmap,
    loadHistory,
    loadSuggestions,
    generate,
    switchActive,
    toggleTask,
    removeRoadmap,
  } = useRoadmap();

  const weekRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Local override to force-show the generate form even when an active
  // roadmap already exists — otherwise there'd be no way to trigger a
  // second roadmap once the first one is generated.
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadActiveRoadmap();
    loadHistory();
    loadSuggestions();
  }, [loadActiveRoadmap, loadHistory, loadSuggestions]);

  if (isLoadingActive) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#9CB68A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ---- No active roadmap yet, OR the user explicitly asked to
  // generate a new one: show the generate form, centered since it's a
  // single focused decision, not a workspace ----
  if (!roadmap || showForm) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center px-6 py-12">
        <RoadmapGenerateForm
          suggestedTopics={suggestedTopics}
          isGenerating={isGenerating}
          onGenerate={async (input) => {
            await generate(input);
            setShowForm(false);
          }}
          onCancel={roadmap ? () => setShowForm(false) : undefined}
        />
      </div>
    );
  }

  // ---- Active roadmap exists and the form isn't open: full workspace layout ----
  return (
    <div className="w-full px-6 md:px-10 lg:px-16 py-8">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <h1 className="font-serif text-3xl md:text-4xl text-[#2D3B2A] truncate">{roadmap.targetRole}</h1>
          <p className="text-sm text-[#2D3B2A]/60 mt-1">
            {roadmap.timelineWeeks} weeks · {roadmap.skillLevel.charAt(0) + roadmap.skillLevel.slice(1).toLowerCase()}
            {roadmap.targetCompanies.length > 0 && ` · Targeting ${roadmap.targetCompanies.join(", ")}`}
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl border border-[#D9C8B4] px-4 py-2.5 text-sm font-medium text-[#2D3B2A] hover:bg-[#D9C8B4]/30 transition-colors flex-shrink-0"
        >
          <Plus size={16} />
          New roadmap
        </button>
      </motion.header>

      {/* Working area: accordion takes the bulk of the width, history
          panel sits alongside — not stacked below, so both are usable
          at once on desktop */}
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <RoadmapAccordion weeks={roadmap.weeks} onToggleTask={toggleTask} weekRefs={weekRefs} />
        </div>
        <RoadmapHistoryPanel history={history} onSwitch={switchActive} onDelete={removeRoadmap} />
      </div>
    </div>
  );
}