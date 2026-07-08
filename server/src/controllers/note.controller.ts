import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// GET /api/notes
export const getNotes = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { category } = req.query;

  const notes = await prisma.note.findMany({
    where: {
      userId,
      ...(category ? { category: category as string } : {}),
    },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      category: true,
      isPinned: true,
      updatedAt: true,
      createdAt: true,
      // content excluded here on purpose - see note below
    },
  });

  res.json(notes);
};

// GET /api/notes/:id
export const getNoteById = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params as { id: string };

  res.set("Cache-Control", "no-store");

  const note = await prisma.note.findFirst({
    where: { id, userId },
  });

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  res.json(note);
};

// POST /api/notes
export const createNote = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { title, content, category, problemId } = req.body;

  const note = await prisma.note.create({
    data: {
      userId,
      title: title || "Untitled",
      content: content || "",
      category,
      problemId,
    },
  });

  res.status(201).json(note);
};

// PATCH /api/notes/:id
export const updateNote = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params as { id: string };
  const { title, content, category, problemId, isPinned } = req.body;

  const existing = await prisma.note.findFirst({ where: { id, userId } });
  if (!existing) {
    return res.status(404).json({ message: "Note not found" });
  }

  const note = await prisma.note.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(category !== undefined && { category }),
      ...(problemId !== undefined && { problemId }),
      ...(isPinned !== undefined && { isPinned }),
    },
  });

  res.json(note);
};

// DELETE /api/notes/:id
export const deleteNote = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params as { id: string };

  const existing = await prisma.note.findFirst({ where: { id, userId } });
  if (!existing) {
    return res.status(404).json({ message: "Note not found" });
  }

  await prisma.note.delete({ where: { id } });

  res.status(204).send();
};