import { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AiSuggestion } from "../../services/resumeService";

interface SuggestionsListProps {
  suggestions: AiSuggestion[]; 
  // the suggestions array from the Resume object — could be empty if 
  // Gemini's call failed (resumeAi.ts returns [] on any error, by design)
}

export function SuggestionsList({ suggestions }: SuggestionsListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null); 
  // tracks which single suggestion is currently expanded — null means all collapsed.
  // Using an index (not a Set of indices) means only ONE can be open at a time,
  // which keeps the list scannable instead of growing into a huge wall of text
  // if someone expands all 6-7 suggestions at once.

  // Handles the specific failure case: Gemini's call errored out, so
  // suggestions came back as an empty array. This is a real, expected
  // state (not a bug) — resumeAi.ts is designed to degrade gracefully
  // rather than break the whole analysis. So this needs its own honest message,
  // not just silently showing nothing.
  if (suggestions.length === 0) {
    return (
      <div>
        <h3 className="font-serif text-lg text-[#2D3B2A] mb-2">Suggestions</h3>
        <p className="text-sm text-[#6B7263]">
          AI suggestions aren't available for this analysis right now. Your ATS score above is still fully accurate.
        </p>
      </div>
    );
  }

  const toggle = (index: number) => {
    setExpandedIndex((current) => (current === index ? null : index)); 
    // clicking the currently-open one closes it; clicking a different one 
    // switches to that one — standard accordion behavior
  };

  return (
    <div>
      <h3 className="font-serif text-lg text-[#2D3B2A] mb-3">Suggestions</h3>
      <div className="flex flex-col gap-2">
        {suggestions.map((item, index) => {
          const isOpen = expandedIndex === index;
          return (
            <div
              key={index} 
              // index as key is acceptable here specifically because this list 
              // is never reordered, filtered, or mutated after initial render —
              // it's a static snapshot from one API response, not a live/editable list
              className="border border-[#D4CFC0] rounded-xl overflow-hidden bg-[#FAF7F2]"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <Lightbulb size={18} className="text-[#9CB68A] shrink-0" />
                <span className="flex-1 text-sm font-medium text-[#2D3B2A]">
                  {item.issue}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={18} className="text-[#6B7263]" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                    // height animation on a wrapping div (not the inner content 
                    // directly) is what makes this expand/collapse smoothly 
                    // instead of the content just snapping in/out
                  >
                    <p className="px-4 pb-4 text-sm text-[#4A5245] leading-relaxed">
                      {item.suggestion}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}