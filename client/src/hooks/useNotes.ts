import { useState, useEffect, useCallback } from "react";
import { noteService } from "@/services/noteService";
import { NoteSummary, CreateNotePayload } from "@/types/note.types";

export const useNotes = (category?: string) => {
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await noteService.getNotes(category);
      setNotes(data);
    } catch (err) {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (payload: CreateNotePayload) => {
    const newNote = await noteService.createNote(payload);
    // prepend so new note shows at top immediately, no refetch needed
    setNotes((prev) => [{ ...newNote, content: undefined as any, problemId: undefined as any }, ...prev]);
    return newNote;
  };

  const removeNote = async (id: string) => {
    const prevNotes = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id)); // optimistic
    try {
      await noteService.deleteNote(id);
    } catch (err) {
      setNotes(prevNotes); // rollback, same pattern as your progress toggle
      throw err;
    }
  };

  // Add this inside useNotes, alongside addNote/removeNote
const updateNoteInList = (id: string, updates: Partial<NoteSummary>) => {
  setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
};


  return { notes, loading, error, addNote, removeNote, updateNoteInList, refetch: fetchNotes };
};