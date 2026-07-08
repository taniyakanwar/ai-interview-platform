// NoteEditor.tsx
// The core Tiptap rich text editor - this is where all the writing happens.
// Receives content from parent (NotePage) and reports changes back up via onChange.

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {TextStyle} from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { createLowlight } from "lowlight"
import EditorToolbar from "./EditorToolbar"

// lowlight needs to know which languages to highlight - keep this light for now,
// add more `.register()` calls later if you want other languages highlighted
import javascript from "highlight.js/lib/languages/javascript"
import python from "highlight.js/lib/languages/python"

const lowlight = createLowlight()
lowlight.register("javascript", javascript)
lowlight.register("python", python)

interface NoteEditorProps {
  content: string                      // Tiptap JSON, stringified (what we saved in DB)
  onChange: (content: string) => void  // fires on every edit, parent handles debounced save
}

function NoteEditor({ content, onChange }: NoteEditorProps) {
    console.log("NoteEditor MOUNTED/RENDER content.length=%d content=%s", content.length, content.slice(0, 60))

  const editor = useEditor({
    extensions: [
      // StarterKit bundles: bold, italic, headings (h1-h3), bullet/ordered list,
      // blockquote, horizontal rule (our divider), history (undo/redo)
      StarterKit.configure({
        codeBlock: false, // we disable StarterKit's basic code block - using CodeBlockLowlight instead
      }),
      
      TextStyle,        // required base for Color to work
      Color,
      Highlight.configure({ multicolor: true }), // multicolor lets us offer more than one highlight color
      Image,
      TaskList,
      TaskItem.configure({ nested: true }), // nested lets checklists have sub-items
      CodeBlockLowlight.configure({ lowlight }),
    ],

    // Parse the saved JSON string back into Tiptap's internal doc format
    content: (() => {
  if (!content) return ""
  try {
    return JSON.parse(content)
  } catch {
    return "" // fallback to empty doc instead of crashing the whole page
  }
})(),

    // Fires on every keystroke/change - we serialize back to JSON string for saving
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      onChange(JSON.stringify(json))
    },

    editorProps: {
      attributes: {
        // Tailwind `prose` class gives nice default typography for rendered rich text
        class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] px-8 py-6",
      },
    },
  })

  // Tiptap needs a moment to initialize - guard against rendering toolbar before it's ready
  if (!editor) return null

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#2D3B2A]/10">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default NoteEditor