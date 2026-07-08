// NotePage.tsx
// The full Notes feature page - sidebar (list of notes) + editor, side by side.
// URL: /notes (no note open) or /notes/:id (specific note open)

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Plus, Trash2, Pin, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { useNotes } from "@/hooks/useNotes"
import { useNote } from "@/hooks/useNote"
import { useDebounce } from "@/hooks/useDebounce"
import NoteEditor from "@/components/notes/NoteEditor"

function NotePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { notes, loading: notesLoading, addNote, removeNote, updateNoteInList } = useNotes()
  const { note, saveNote, saving } = useNote(id)

  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(true)
  const [localContent, setLocalContent] = useState("")
  const [localTitle, setLocalTitle] = useState("")

  // Debounce - actual save only fires 1 second after typing stops
  const debouncedContent = useDebounce(localContent, 1000)
  const debouncedTitle = useDebounce(localTitle, 1000)

  // ── Refs (not state) - these always hold the LATEST values instantly,
  // without waiting for a re-render, and are never subject to React's async timing. ──

  // Tags which note ID the current localContent/localTitle actually belongs to.
  const noteIdRef = useRef<string | undefined>(undefined)

  // Always-current mirrors of what's typed right now, updated every keystroke
  const localContentRef = useRef("")
  const localTitleRef = useRef("")

  // The "baseline" - what the note looked like right after it was last loaded/saved.
  // Used ONLY for comparison ("did anything actually change?"). Critically, this is
  // updated purely through refs, never by reading the `note` object directly inside
  // an effect that fires on `id` changing - that mismatch (id updates instantly,
  // `note` data arrives late) was the actual root cause of the swapping/disappearing bug.
  const originalContentRef = useRef("")
  const originalTitleRef = useRef("")

  // Keep "currently typed" refs in sync with state on every keystroke
  useEffect(() => {
    localContentRef.current = localContent
  }, [localContent])

  useEffect(() => {
    localTitleRef.current = localTitle
  }, [localTitle])

  // When the fetched note actually changes (new note truly loaded), sync local state
  // AND record the baseline refs - this only runs once real data has arrived
  useEffect(() => {
    if (note) {
      console.log("[note?.id] note.id=%s localContent prior=%s", note.id, localContent.slice(0, 40))
      setLocalContent(note.content)
      setLocalTitle(note.title)
      noteIdRef.current = note.id
      originalContentRef.current = note.content
      originalTitleRef.current = note.title
    }
  }, [note?.id])

  // Debounced auto-save - fires ~1s after typing stops
  useEffect(() => {
    if (!note) { console.log("debounce BAIL no note"); return }
    if (noteIdRef.current !== id) { console.log("debounce BAIL noteIdRef=%s !== id=%s", noteIdRef.current, id); return }

    // Compare against the baseline refs, not `note` directly
    if (debouncedContent === originalContentRef.current && debouncedTitle === originalTitleRef.current) {
      console.log("debounce SKIP no diff"); return
    }

    console.log("debounce SAVE id=%s content=%s | origRef=%s", id, debouncedContent.slice(0, 30), originalContentRef.current.slice(0, 30))
    // Move the baseline forward only AFTER the save completes (so a failed save
    // doesn't silently lose the diff — the next debounce will retry).
    saveNote({ content: debouncedContent, title: debouncedTitle })
      .then(() => {
        originalContentRef.current = debouncedContent
        originalTitleRef.current = debouncedTitle
        console.log("debounce .then — baseline advanced to %s", debouncedContent.slice(0, 30))
      })
      .catch(() => {
        /* save failed — baseline stays put, next debounce will retry */
      })
    updateNoteInList(id!, { title: debouncedTitle }) // keep sidebar label in sync immediately
  }, [debouncedContent, debouncedTitle])

  // Flush immediately when switching AWAY from a note (don't wait for debounce).
  // Uses ONLY refs - never reads `note` directly - so it can never be fooled by
  // a `note` object that hasn't caught up to the current `id` yet.
  //
  // CRITICAL GUARD: verify that the local content actually belongs to the note
  // we're leaving (noteIdRef.current matches the closured `id`).  When the user
  // rapidly switches A → B → A before B even loads, noteIdRef.current is still
  // "A" but `id` in the closure is "B" — without this guard we'd write A's
  // content into B, which is the content-bleeding bug.
  useEffect(() => {
    console.log("CLEANUP SETUP id=%s noteIdRef=%s", id, noteIdRef.current)
    return () => {
      console.log("CLEANUP RUN id(closured)=%s noteIdRef=%s localContentRef=%s origContentRef=%s", id, noteIdRef.current, localContentRef.current.slice(0,20), originalContentRef.current.slice(0,20))
      if (noteIdRef.current !== id) { console.log("CLEANUP BAIL — noteIdRef mismatch"); return }
      if (
        localContentRef.current !== originalContentRef.current ||
        localTitleRef.current !== originalTitleRef.current
      ) {
        console.log("CLEANUP SAVE to id=%s", id)
        saveNote({ content: localContentRef.current, title: localTitleRef.current })
      } else {
        console.log("CLEANUP no diff — skip save")
      }
    }
  }, [id])

  const handleNewNote = async () => {
    const newNote = await addNote({ title: "Untitled" })
    navigate(`/notes/${newNote.id}`)
  }

  const handleDelete = async (noteId: string) => {
    await removeNote(noteId)
    if (id === noteId) navigate("/notes") // if you delete the currently open note, back out
  }

  return (
    <div className="flex h-full">

      {/* ── Notes sidebar (separate from main app sidebar) ── */}
      {isNotesSidebarOpen && (
        <div className="w-72 flex-shrink-0 border-r border-[#2D3B2A]/10 bg-white flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-[#2D3B2A]/10">
            <h2 className="font-serif text-lg text-[#2D3B2A]">Notes</h2>
            <button onClick={handleNewNote} className="p-1.5 rounded-lg hover:bg-[#2D3B2A]/5" title="New note">
              <Plus size={18} className="text-[#2D3B2A]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {notesLoading && <p className="text-sm text-[#2D3B2A]/50 p-2">Loading notes...</p>}
            {!notesLoading && notes.length === 0 && (
              <p className="text-sm text-[#2D3B2A]/50 p-2">No notes yet. Create one!</p>
            )}
            {notes.map((n) => (
              <div
                key={n.id}
                onClick={() => navigate(`/notes/${n.id}`)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm ${
                  id === n.id ? "bg-[#9CB68A]/20 text-[#2D3B2A]" : "hover:bg-[#2D3B2A]/5 text-[#2D3B2A]/80"
                }`}
              >
                <span className="truncate flex items-center gap-1.5">
                  {n.isPinned && <Pin size={12} className="flex-shrink-0" />}
                  {n.title || "Untitled"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation() // don't trigger the navigate() above
                    handleDelete(n.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main editor area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b border-[#2D3B2A]/10">
          {/* Notes sidebar toggle - independent from the main app sidebar toggle */}
          <button onClick={() => setIsNotesSidebarOpen((prev) => !prev)} className="text-[#2D3B2A]/60 hover:text-[#2D3B2A]">
            {isNotesSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>

          {/* Only show the title input once the note truly matches the URL - avoids
              showing/editing a stale title during the fetch gap after switching notes */}
          {note && note.id === id && (
            <input
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder="Untitled"
              className="flex-1 text-xl font-serif font-semibold text-[#2D3B2A] outline-none bg-transparent"
            />
          )}

          {/* Tiny save status indicator */}
          <span className="text-xs text-[#2D3B2A]/40">
            {saving ? "Saving..." : note && note.id === id ? "Saved" : ""}
          </span>
        </div>

        <div className="flex-1 overflow-hidden p-4">
          {/* No note selected at all */}
          {!id && (
            <div className="h-full flex items-center justify-center text-[#2D3B2A]/40">
              Select a note or create a new one to get started
            </div>
          )}

          {/* Only render the editor once the fetched `note` actually matches the current
              URL `id` - avoids the fetch-gap race condition where `id` has updated but
              `note` still holds the previous note's data.
              
              CRITICAL: also wait for noteIdRef.current to match id.  noteIdRef is
              updated INSIDE the [note?.id] effect (which also syncs localContent).
              Without this check, the editor mounts during the first render where
              note.id === id but BEFORE [note?.id] fires — meaning localContent still
              carries the PREVIOUS note's content, and Tiptap fires onUpdate with it,
              bleeding content into this note. */}
          {id && note && note.id === id && noteIdRef.current === id && (
            <NoteEditor key={id} content={localContent} onChange={setLocalContent} />
          )}

          {/* Brief loading state during that fetch gap, instead of a stale/wrong editor */}
          {id && (!note || note.id !== id) && (
            <div className="h-full flex items-center justify-center text-[#2D3B2A]/40">
              Loading note...
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default NotePage