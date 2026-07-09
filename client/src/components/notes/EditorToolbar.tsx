// EditorToolbar.tsx
// The formatting toolbar above the editor - bold, italic, headings, color, etc.
// Takes the `editor` instance as a prop so it can read state (is bold active?) and issue commands.

import { Editor } from "@tiptap/react"
import { useRef } from "react"
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare,
  Code, Minus, Image as ImageIcon,
  Highlighter, Palette,
} from "lucide-react"
import axiosInstance from "@/api/axios" // same shared axios instance used elsewhere
import { useState } from "react"

interface EditorToolbarProps {
  editor: Editor
}

// Small reusable button - active state highlighted based on current cursor position
function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        active ? "bg-[#9CB68A]/30 text-[#2D3B2A]" : "text-[#2D3B2A]/60 hover:bg-[#2D3B2A]/5"
      }`}
    >
      {children}
    </button>
  )
}

const TEXT_COLORS = ["#2D3B2A", "#B33951", "#3457D5", "#D68C45", "#6A0DAD"]
const HIGHLIGHT_COLORS = ["#FFF3B0", "#B7E4C7", "#FFD6D6", "#D6E4FF"]
const FONT_SIZES = [
  { label: "Small", value: "14px" },
  { label: "Normal", value: "16px" },
  { label: "Large", value: "20px" },
  { label: "XL", value: "24px" },
]

function EditorToolbar({ editor }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)


  // Triggered when user picks an image file - converts to base64 and inserts directly
  // NOTE: base64 inline images are simplest for now; if notes get image-heavy later,
  // swap this for real file upload to Cloudinary (you already have it from your stack) + insert URL instead
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Build a FormData object - this is how files get sent over HTTP,
    // NOT as JSON. The field name "image" here must match upload.single("image")
    // on the backend route exactly, or multer won't find the file.
    const formData = new FormData()
    formData.append("image", file)

    setIsUploading(true)
    try {
      const { data } = await axiosInstance.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      // data.url is the Cloudinary-hosted URL our backend returned -
      // insert THIS into the editor, not base64 data
      editor.chain().focus().setImage({ src: data.url }).run()
    } catch (err) {
      console.error("Image upload failed:", err)
      alert("Image upload failed. Please try again.") // simple feedback for now
    } finally {
      setIsUploading(false)
      e.target.value = "" // reset so selecting the same file again still fires onChange
    }
  }


  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[#2D3B2A]/10">

      {/* ── Text style ── */}
      <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon size={16} />
      </ToolbarButton>
      <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={16} />
      </ToolbarButton>

      <div className="w-px h-6 bg-[#2D3B2A]/10 mx-1" /> {/* divider between button groups */}

      {/* ── Headings ── */}
      <ToolbarButton title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 size={16} />
      </ToolbarButton>
      <ToolbarButton title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 size={16} />
      </ToolbarButton>

      <div className="w-px h-6 bg-[#2D3B2A]/10 mx-1" />

      {/* ── Font size ── */}
      {/* Uses inline style via TextStyle mark - simplest way to get font-size without a dedicated extension */}
      <select
        onChange={(e) => editor.chain().focus().setMark("textStyle", { style: `font-size: ${e.target.value}` }).run()}
        className="text-xs bg-transparent border border-[#2D3B2A]/10 rounded-lg px-2 py-1.5 text-[#2D3B2A]/70 outline-none"
        defaultValue=""
        title="Text size"
      >
        <option value="" disabled>Size</option>
        {FONT_SIZES.map((size) => (
          <option key={size.value} value={size.value}>{size.label}</option>
        ))}
      </select>

      <div className="w-px h-6 bg-[#2D3B2A]/10 mx-1" />

      {/* ── Lists + checklist ── */}
      <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton title="Checklist" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
        <CheckSquare size={16} />
      </ToolbarButton>

      <div className="w-px h-6 bg-[#2D3B2A]/10 mx-1" />

      {/* ── Code block + divider ── */}
      <ToolbarButton title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code size={16} />
      </ToolbarButton>
      <ToolbarButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus size={16} />
      </ToolbarButton>

      <div className="w-px h-6 bg-[#2D3B2A]/10 mx-1" />

      {/* ── Text color swatches ── */}
      <div className="flex items-center gap-1 px-1">
        <Palette size={14} className="text-[#2D3B2A]/40" />
        {TEXT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            title={`Text color ${color}`}
            onClick={() => editor.chain().focus().setColor(color).run()}
            className="w-4 h-4 rounded-full border border-black/10"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* ── Highlight swatches ── */}
      <div className="flex items-center gap-1 px-1">
        <Highlighter size={14} className="text-[#2D3B2A]/40" />
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            title={`Highlight ${color}`}
            onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
            className="w-4 h-4 rounded-full border border-black/10"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-[#2D3B2A]/10 mx-1" />

      {/* ── Image upload ── */}
      
      <ToolbarButton title="Insert image" onClick={() => fileInputRef.current?.click()}>
        {isUploading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <ImageIcon size={16} />
        )}
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  )
}

export default EditorToolbar