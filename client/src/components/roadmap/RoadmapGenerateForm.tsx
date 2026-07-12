// RoadmapGenerateForm.tsx
// Shown when the user has no active roadmap yet, or explicitly asks to
// generate a new one — collects inputs and hands a RoadmapGenerateInput
// up to the parent page on submit.

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { RoadmapGenerateInput, SkillLevel } from "@/types/roadmap.types";

interface RoadmapGenerateFormProps {
  suggestedTopics: string[];
  isGenerating: boolean;
  onGenerate: (input: RoadmapGenerateInput) => void;
  onCancel?: () => void; // optional — only passed when there's an existing roadmap to go back to
}

const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

export default function RoadmapGenerateForm({
  suggestedTopics,
  isGenerating,
  onGenerate,
  onCancel,
}: RoadmapGenerateFormProps) {
  const [targetRole, setTargetRole] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("INTERMEDIATE");
  const [timelineWeeks, setTimelineWeeks] = useState<number | "">("");
  const [companyInput, setCompanyInput] = useState("");
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [customTopic, setCustomTopic] = useState("");

  // Once suggestions arrive from the backend, pre-select ALL of them by
  // default — the student edits DOWN (removes what's irrelevant) rather
  // than building the list from zero, since these came from real
  // struggle-signal data, not a guess.
  useEffect(() => {
    setSelectedTopics(new Set(suggestedTopics));
  }, [suggestedTopics]);

  function addCompany() {
    const trimmed = companyInput.trim();
    if (trimmed && !companies.includes(trimmed)) {
      setCompanies((prev) => [...prev, trimmed]);
    }
    setCompanyInput("");
  }

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      next.has(topic) ? next.delete(topic) : next.add(topic);
      return next;
    });
  }

  function addCustomTopic() {
    const trimmed = customTopic.trim();
    if (trimmed) {
      setSelectedTopics((prev) => new Set(prev).add(trimmed));
    }
    setCustomTopic("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetRole.trim()) return;

    onGenerate({
      targetRole: targetRole.trim(),
      skillLevel,
      // Blank timeline is intentional — backend/Gemini picks a sensible
      // default when the student doesn't have a fixed deadline in mind.
      timelineWeeks: timelineWeeks === "" ? 8 : Number(timelineWeeks),
      targetCompanies: companies,
      weakTopics: [...selectedTopics],
    });
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl rounded-3xl bg-white border border-[#D9C8B4]/60 p-8 md:p-10 shadow-sm"
    >
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-[#2D3B2A]/50 hover:text-[#2D3B2A] mb-6 -mt-2 block"
        >
          ← Back to my roadmap
        </button>
      )}

      <h2 className="font-serif text-3xl text-[#2D3B2A] mb-1">Plan your prep</h2>
      <p className="text-sm text-[#2D3B2A]/60 mb-8">
        Tell me where you're headed — I'll lay out the path.
      </p>

      {/* Target role */}
      <label className="block mb-6">
        <span className="text-sm font-medium text-[#2D3B2A] mb-2 block">Target role</span>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. SDE, Backend Developer, Data Engineer"
          required
          className="w-full rounded-xl border border-[#D9C8B4] bg-[#FAF7F2]/50 px-4 py-3 text-sm text-[#2D3B2A] outline-none focus:border-[#9CB68A] focus:ring-2 focus:ring-[#9CB68A]/20 transition-all"
        />
      </label>

      {/* Skill level — segmented control */}
      <div className="mb-6">
        <span className="text-sm font-medium text-[#2D3B2A] mb-2 block">Current level</span>
        <div className="flex gap-2">
          {SKILL_LEVELS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSkillLevel(value)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                skillLevel === value
                  ? "bg-[#2D3B2A] text-[#FAF7F2]"
                  : "bg-[#FAF7F2] text-[#2D3B2A]/70 hover:bg-[#D9C8B4]/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline — optional */}
      <label className="block mb-6">
        <span className="text-sm font-medium text-[#2D3B2A] mb-2 block">
          Timeline (weeks) <span className="text-[#2D3B2A]/40 font-normal">— optional</span>
        </span>
        <input
          type="number"
          min={1}
          max={52}
          value={timelineWeeks}
          onChange={(e) => setTimelineWeeks(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="Leave blank and I'll suggest one"
          className="w-full rounded-xl border border-[#D9C8B4] bg-[#FAF7F2]/50 px-4 py-3 text-sm text-[#2D3B2A] outline-none focus:border-[#9CB68A] focus:ring-2 focus:ring-[#9CB68A]/20 transition-all"
        />
      </label>

      {/* Target companies — chip input */}
      <div className="mb-6">
        <span className="text-sm font-medium text-[#2D3B2A] mb-2 block">
          Target companies <span className="text-[#2D3B2A]/40 font-normal">— optional</span>
        </span>
        <div className="flex flex-wrap gap-2 mb-2">
          {companies.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1.5 rounded-full bg-[#9CB68A]/20 text-[#2D3B2A] text-xs font-medium px-3 py-1.5"
            >
              {c}
              <button type="button" onClick={() => setCompanies((prev) => prev.filter((x) => x !== c))}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={companyInput}
          onChange={(e) => setCompanyInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addCompany();
            }
          }}
          placeholder="Type a company and press Enter"
          className="w-full rounded-xl border border-[#D9C8B4] bg-[#FAF7F2]/50 px-4 py-3 text-sm text-[#2D3B2A] outline-none focus:border-[#9CB68A] focus:ring-2 focus:ring-[#9CB68A]/20 transition-all"
        />
      </div>

      {/* Weak topics — pre-filled, toggleable chips */}
      <div className="mb-8">
        <span className="text-sm font-medium text-[#2D3B2A] mb-2 block">
          Focus topics <span className="text-[#2D3B2A]/40 font-normal">— pulled from your progress, edit freely</span>
        </span>
        <div className="flex flex-wrap gap-2 mb-2">
          {[...selectedTopics].map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => toggleTopic(topic)}
              className="flex items-center gap-1.5 rounded-full bg-[#2D3B2A] text-[#FAF7F2] text-xs font-medium px-3 py-1.5"
            >
              {topic}
              <X size={12} />
            </button>
          ))}
          {suggestedTopics
            .filter((t) => !selectedTopics.has(t))
            .map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => toggleTopic(topic)}
                className="rounded-full border border-[#D9C8B4] text-[#2D3B2A]/60 text-xs font-medium px-3 py-1.5 hover:border-[#9CB68A]"
              >
                + {topic}
              </button>
            ))}
        </div>
        <input
          type="text"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustomTopic();
            }
          }}
          placeholder="Add another topic..."
          className="w-full rounded-xl border border-[#D9C8B4] bg-[#FAF7F2]/50 px-4 py-2.5 text-sm text-[#2D3B2A] outline-none focus:border-[#9CB68A] transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={isGenerating || !targetRole.trim()}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2D3B2A] text-[#FAF7F2] font-medium py-3.5 hover:bg-[#2D3B2A]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Sparkles size={16} />
        {isGenerating ? "Laying out your path..." : "Generate my roadmap"}
      </button>
    </motion.form>
  );
}