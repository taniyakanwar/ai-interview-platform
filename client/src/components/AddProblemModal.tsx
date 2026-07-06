// client/src/components/AddProblemModal.tsx
//
// A simple popup form for adding a custom problem (title, difficulty, tags, source link).
// Since there's no in-app code editor yet, this acts like a bookmark card —
// sourceUrl lets the user link out to wherever the actual problem lives (LeetCode, CodeChef, etc.)

import { useState } from "react";
import { X } from "lucide-react";
import { createProblem } from "@/services/problemService";
import type { Problem } from "@/types/problem";

interface AddProblemModalProps {
  onClose: () => void;                        // called when the modal should close (cancel or after success)
  onProblemCreated: (problem: Problem) => void; // called with the new problem, so the parent can add it to the table
}

export default function AddProblemModal({ onClose, onProblemCreated }: AddProblemModalProps) {
  // Form field state — one useState per field, simplest approach for a short form
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [summary, setSummary] = useState("");
  const [tagsInput, setTagsInput] = useState(""); // raw comma-separated text, e.g. "arrays, two-pointers"
  const [sourceUrl, setSourceUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // stop the browser's default full-page-reload form submission

    // Basic client-side check — matches the backend's required fields (title, difficulty, summary)
    if (!title.trim() || !summary.trim()) {
      setError("Title and summary are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Turn "arrays, two-pointers" into ["arrays", "two-pointers"],
      // trimming whitespace and dropping empty entries (e.g. trailing commas)
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const newProblem = await createProblem({
        title: title.trim(),
        difficulty,
        summary: summary.trim(),
        tags,
        sourceUrl: sourceUrl.trim() || undefined, // send undefined instead of empty string if left blank
      });

      onProblemCreated(newProblem); // hand the new problem back to CodingPractice.tsx
      onClose(); // close the modal on success
    } catch (err) {
      console.error("Failed to create problem:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    // Backdrop — covers the whole screen, semi-transparent dark overlay,
    // clicking it closes the modal (common UX pattern: "click outside to dismiss")
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      {/* The modal box itself — stopPropagation so clicking INSIDE the form doesn't bubble up and close it */}
      <div
        className="bg-[#FAF7F2] rounded-2xl shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close (X) button, top-right corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#2D3B2A]/50 hover:text-[#2D3B2A] transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-[#2D3B2A] mb-4" style={{ fontFamily: "Fraunces, serif" }}>
          Add a Problem
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-[#2D3B2A] block mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Two Sum"
              className="w-full border border-[#2D3B2A]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#9CB68A]"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-sm font-medium text-[#2D3B2A] block mb-1">Difficulty *</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")}
              className="w-full border border-[#2D3B2A]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#9CB68A]"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Summary */}
          <div>
            <label className="text-sm font-medium text-[#2D3B2A] block mb-1">Summary *</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short description of the problem"
              rows={3}
              className="w-full border border-[#2D3B2A]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#9CB68A] resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-[#2D3B2A] block mb-1">Tags</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="arrays, two-pointers (comma-separated)"
              className="w-full border border-[#2D3B2A]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#9CB68A]"
            />
          </div>

          {/* Source URL */}
          <div>
            <label className="text-sm font-medium text-[#2D3B2A] block mb-1">Source Link</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className="w-full border border-[#2D3B2A]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#9CB68A]"
            />
          </div>

          {/* Error message, only shows if something went wrong */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Submit button — disabled + text changes while submitting, prevents double-submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 bg-[#2D3B2A] text-[#FAF7F2] rounded-full py-2 font-medium hover:bg-[#2D3B2A]/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add Problem"}
          </button>
        </form>
      </div>
    </div>
  );
}