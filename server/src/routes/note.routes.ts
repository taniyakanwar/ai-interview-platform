import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/note.controller";

const router = Router();

router.use(protect);

router.get("/", getNotes);
router.get("/:id", getNoteById);
router.post("/", createNote);
router.patch("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;