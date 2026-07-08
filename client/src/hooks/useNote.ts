import { useState, useEffect, useCallback, useRef } from "react";
import { noteService } from "@/services/noteService";
import { Note, UpdateNotePayload } from "@/types/note.types";

export const useNote = (id: string | undefined) => {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // THE FIX: tracks the most recently REQUESTED note id.
  // Async responses can arrive out of order (network timing isn't guaranteed) -
  // this lets us detect and discard a response that's no longer relevant,
  // e.g. you switched to Note 2 then back to Note 1 before Note 2's fetch resolved.
  const latestRequestId = useRef<string | undefined>(undefined);

  const fetchNote = useCallback(async () => {
    if (!id) {
      console.log("fetchNote: no id → setNote(null)");
      setNote(null);
      return;
    }

    latestRequestId.current = id;
    const requestedId = id;

    try {
      setLoading(true);
      console.log("fetchNote STARTING id=%s", requestedId);
      const data = await noteService.getNoteById(requestedId);

      const guardOk = latestRequestId.current === requestedId;
      console.log("fetchNote RESPONSE requestedId=%s latestRequestId=%s guardOk=%s content=%s", requestedId, latestRequestId.current, guardOk, (data.content || "").slice(0, 30));
      if (!guardOk) return;

      setNote(data);
    } catch (err) {
      if (latestRequestId.current !== requestedId) return;
      setError("Failed to load note");
    } finally {
      if (latestRequestId.current === requestedId) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const saveNote = async (payload: UpdateNotePayload) => {
    if (!id) { console.log("saveNote BAIL no id"); return; }
    setSaving(true);
    console.log("saveNote CALLED id=%s payload.content=%s", id, (payload.content || "").slice(0, 40));
    try {
      const updated = await noteService.updateNote(id, payload);
      const guardOk = latestRequestId.current === id;
      console.log("saveNote RESPONSE id=%s latestRequestId=%s guardOk=%s", id, latestRequestId.current, guardOk);
      if (guardOk) {
        setNote(updated);
        console.log("saveNote setNote called id=%s", id);
      }
    } finally {
      setSaving(false);
    }
  };

  return { note, loading, error, saving, saveNote, refetch: fetchNote };
};