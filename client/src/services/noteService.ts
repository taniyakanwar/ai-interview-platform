import axiosInstance from "@/api/axios"; // shared axios instance with JWT interceptor (Day 8-9)
import { Note, NoteSummary, CreateNotePayload, UpdateNotePayload } from "@/types/note.types";

// All note-related API calls, grouped in one object - same pattern as problemService.ts
export const noteService = {
  // Fetch all notes for the logged-in user (lightweight - no `content` field, see backend controller)
  // Optional category filter e.g. noteService.getNotes("DSA")
  getNotes: async (category?: string): Promise<NoteSummary[]> => {
    const { data } = await axiosInstance.get("/notes", {
      params: category ? { category } : undefined,
    });
    return data;
  },

  // Fetch one full note (with content) - used when opening a note in the editor
  getNoteById: async (id: string): Promise<Note> => {
    const { data } = await axiosInstance.get(`/notes/${id}`, {
    headers: {
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    },
  });
  return data;
  },

  // Create a new note - title/content/category/problemId all optional,
  // backend defaults title to "Untitled" and content to "" if not passed
  createNote: async (payload: CreateNotePayload): Promise<Note> => {
    const { data } = await axiosInstance.post("/notes", payload);
    return data;
  },

  // Update an existing note - used for both manual edits and auto-save (debounced content updates)
  updateNote: async (id: string, payload: UpdateNotePayload): Promise<Note> => {
    const { data } = await axiosInstance.patch(`/notes/${id}`, payload);
    return data;
  },

  // Delete a note permanently
  deleteNote: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/notes/${id}`);
  },
};