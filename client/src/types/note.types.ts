export interface Note {
  id: string;
  title: string;
  content: string;
  category: string | null;
  problemId: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// Used for the sidebar list - lighter payload, no content
export type NoteSummary = Omit<Note, "content" | "problemId">;

export interface CreateNotePayload {
  title?: string;
  content?: string;
  category?: string;
  problemId?: string;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  category?: string;
  problemId?: string;
  isPinned?: boolean;
}