import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResumeUploadZoneProps {
  onFileSelect: (file: File | null) => void; 
  // accepts null too — needed for the "remove selected file" case below,
  // no cast needed since this prop is properly typed for it
  selectedFile: File | null; 
  // controlled from the parent, so this component has no hidden internal file state
}

export function ResumeUploadZone({ onFileSelect, selectedFile }: ResumeUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false); 
  // true only while a file is being dragged OVER the zone — purely visual feedback

  const [error, setError] = useState<string | null>(null); 
  // local validation error (wrong file type, too large) — shown inline

  const inputRef = useRef<HTMLInputElement>(null); 
  // lets us trigger the native file picker via a styled div's onClick, 
  // instead of showing the ugly default browser "Choose File" button

  // ---------- VALIDATION ----------
  const validateAndSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Please upload a PDF under 5MB.");
      return;
    }
    setError(null);
    onFileSelect(file);
  };

  // ---------- DRAG HANDLERS ----------
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  };

  // ---------- CLICK-TO-BROWSE HANDLER ----------
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    onFileSelect(null);
    setError(null);
  };

  return (
    // Outer wrapper is now flex-1 flex flex-col — lets this whole component 
    // stretch to fill the parent card's full height (matching the JD box 
    // next to it in ResumeAnalyzer.tsx), instead of only sizing to its content.
    <div className="flex-1 flex flex-col">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          // ---------- EMPTY STATE: drop zone ----------
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              flex-1 flex flex-col items-center justify-center gap-3 
              border-2 border-dashed rounded-2xl p-8 cursor-pointer
              transition-colors duration-200
              ${isDragging 
                ? "border-[#2D3B2A] bg-[#F0EDE3]" 
                : "border-[#E3DDD0] bg-[#FAF7F2] hover:border-[#9CB68A]"}
            `}
            // flex-1 added so this stretches to fill available height.
            // Idle border color changed from #D4CFC0 -> #E3DDD0 (lighter), 
            // so it now sits visibly lighter than the outer card border 
            // (#B5AC96) wrapping this whole component in ResumeAnalyzer.tsx —
            // that contrast is what makes the nesting readable.
            // Padding reduced from p-12 -> p-8 since the box is now taller 
            // overall and doesn't need as much padding to feel substantial.
          >
            <Upload
              size={32}
              className={isDragging ? "text-[#2D3B2A]" : "text-[#9CB68A]"}
            />
            <p className="font-serif text-lg text-[#2D3B2A]">
              Drop your resume PDF here
            </p>
            <p className="text-sm text-[#6B7263]">or click to browse</p>

            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              onChange={handleInputChange}
              className="hidden"
            />
          </motion.div>
        ) : (
          // ---------- FILLED STATE: selected file preview ----------
          <motion.div
            key="filled"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex items-center gap-3 border border-[#E3DDD0] rounded-2xl p-4 bg-[#FAF7F2]"
            // flex-1 added here too, so the filled state also stretches to 
            // match height; border lightened to match the empty state's tone
          >
            <FileText size={24} className="text-[#2D3B2A] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#2D3B2A] truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-[#6B7263]">
                {(selectedFile.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="p-1.5 rounded-full hover:bg-[#EDE8DE] transition-colors"
              aria-label="Remove file"
            >
              <X size={18} className="text-[#6B7263]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-sm text-[#C97B5A] mt-2">{error}</p>
      )}
    </div>
  );
}