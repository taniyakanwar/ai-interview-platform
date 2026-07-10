import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileSearch, Target, Lightbulb, ChevronDown } from "lucide-react";
import { useResumeAnalysis } from "../hooks/useResumeAnalysis";
import { ResumeUploadZone } from "../components/resume/ResumeUploadZone";
import { ScoreGauge } from "../components/resume/ScoreGauge";
import { MissingSkillsChips } from "../components/resume/MissingSkillsChips";
import { AiSuggestion } from "../services/resumeService";

// ---------- Local horizontal suggestions grid ----------
// Lays suggestion cards out in a responsive grid so the section uses the
// FULL page width, instead of being squeezed into a half-column next to
// an often-empty missing-skills box.
function SuggestionsGrid({ suggestions }: { suggestions: AiSuggestion[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (suggestions.length === 0) {
    return (
      <p className="text-sm text-[#6B7263]">
        AI suggestions aren't available for this analysis right now. Your ATS score above is still fully accurate.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {suggestions.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="rounded-xl border border-[#D4CFC0] bg-white/40 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-start gap-2.5 p-4 text-left"
            >
              <Lightbulb size={16} className="text-[#9CB68A] shrink-0 mt-0.5" />
              <span className="flex-1 text-sm font-medium text-[#2D3B2A]">
                {item.issue}
              </span>
              <ChevronDown
                size={16}
                className={`text-[#6B7263] shrink-0 mt-0.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <p className="px-4 pb-4 text-sm text-[#4A5245] leading-relaxed">
                {item.suggestion}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ResumeAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetJD, setTargetJD] = useState("");

  const { resume, isAnalyzing, error, analyze, reset } = useResumeAnalysis();

  const handleAnalyze = () => {
    if (!selectedFile) return;
    analyze(selectedFile, targetJD || undefined);
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
    setTargetJD("");
  };

  // ==================== RESULTS VIEW ====================
  if (resume) {
    return (
      <div className="w-full px-8 py-8">
        <button
          onClick={handleReset}
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#6B7263] hover:text-[#2D3B2A] transition-colors"
        >
          <ArrowLeft size={16} />
          Analyze another resume
        </button>

        {/* Score card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid gap-8 rounded-2xl border border-[#D4CFC0] bg-[#FAF7F2] p-8 lg:grid-cols-[320px_1fr] lg:items-center mb-6"
        >
          <div className="flex justify-center">
            <ScoreGauge score={resume.atsScore} size={200} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-[#2D3B2A]" />
              <h3 className="font-serif text-xl text-[#2D3B2A]">
                Score Breakdown
              </h3>
            </div>

            {/* Each value sits in its own filled pill, clearly separated 
                from the label — fixes "1/3 Strong action verbs" reading 
                as one run-on phrase */}
            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(resume.scoreBreakdown).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[#6B7263] leading-snug">
                    {label}
                  </span>
                  <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#EDF0E6] text-sm font-medium text-[#2D3B2A]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Missing skills — only rendered when there's actually content */}
        {resume.missingSkills.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.03 }}
            className="rounded-2xl border border-[#D4CFC0] bg-[#FAF7F2] p-6 mb-6"
          >
            <MissingSkillsChips skills={resume.missingSkills} />
          </motion.section>
        )}

        {/* Suggestions — full width horizontal grid */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-2xl border border-[#D4CFC0] bg-[#FAF7F2] p-6"
        >
          <h3 className="font-serif text-xl text-[#2D3B2A] mb-4">
            Suggestions
          </h3>
          <SuggestionsGrid suggestions={resume.suggestions} />
        </motion.section>
      </div>
    );
  }

  // ==================== UPLOAD VIEW ====================
  return (
    <div className="w-full px-8 py-10">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-[#9CB68A] font-medium mb-3">
          Resume Analyzer
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-[#2D3B2A] leading-tight mb-4">
          Your resume gets interviewed.
          <br />
          Your privacy doesn't.
        </h1>
        <p className="text-base text-[#6B7263] max-w-xl mx-auto leading-relaxed">
          Upload your resume to get an instant ATS score, see exactly which
          skills are missing for your target role, and get concrete AI
          suggestions to fix what's holding you back.
        </p>
      </div>

      {/* Twin boxes — equal height via items-stretch + h-full + flex-col.
          Outer border (#B5AC96) is deliberately darker than any inner 
          element border (#E3DDD0) so the nesting reads clearly. */}
      <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2 items-stretch">
        <div className="rounded-2xl border-2 border-[#d8d6cf] bg-[#FAF7F2] p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-[#EDF0E6] flex items-center justify-center">
              <FileSearch size={16} className="text-[#2D3B2A]" />
            </div>
            <h2 className="font-serif text-lg text-[#2D3B2A]">
              Upload resume
            </h2>
          </div>
          <div className="flex-1 flex flex-col">
            <ResumeUploadZone
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
            />
          </div>
        </div>

        <div className="rounded-2xl border-2 border-[#d8d6cf] bg-[#FAF7F2] p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-[#EDF0E6] flex items-center justify-center">
              <Target size={16} className="text-[#2D3B2A]" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-[#2D3B2A]">
                Target job description
              </h2>
              <p className="text-xs text-[#6B7263]">Optional</p>
            </div>
          </div>
          <textarea
            value={targetJD}
            onChange={(e) => setTargetJD(e.target.value)}
            placeholder="Paste a job description to get tailored keyword matching and suggestions..."
            className="w-full flex-1 min-h-[180px] rounded-xl border border-[#E3DDD0] bg-[#FAF7F2] p-3 text-sm text-[#2D3B2A] placeholder:text-[#A8A296] focus:outline-none focus:border-[#9CB68A] transition-colors resize-none"
          />
        </div>
      </div>

      {error && (
        <p className="max-w-4xl mx-auto text-sm text-[#C97B5A] mt-4 text-center">
          {error}
        </p>
      )}

      <div className="flex justify-center mt-8">
        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || isAnalyzing}
          className="px-10 py-3 rounded-xl bg-[#2D3B2A] text-[#FAF7F2] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3D4D3A] transition-colors"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>
    </div>
  );
}