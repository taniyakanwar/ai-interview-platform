import { Router } from "express";
import { protect } from "../middleware/auth.middleware"; // same middleware protecting your resume/notes routes
import { uploadDoubtImage } from "../middleware/doubtUpload";
import {
  sendDoubtMessage,
  getDoubtHistory,
  getDoubtSessionById,
  deleteDoubtSession
} from "../controllers/doubt.controller";

const router = Router();

// All doubt routes require login — protect runs first, attaches req.user,
// same pattern as every other feature (resume, notes, problems).
router.use(protect);

// POST /api/doubts — handles BOTH starting a new session (no sessionId in
// body) and sending a follow-up (sessionId present). One endpoint, two
// cases, branched inside the controller — see sendDoubtMessage.
router.post("/", uploadDoubtImage, sendDoubtMessage);

// GET /api/doubts — sidebar history list (titles only, lightweight)
router.get("/", getDoubtHistory);

// GET /api/doubts/:id — full conversation thread for one session
router.get("/:id", getDoubtSessionById);

router.delete("/:id", deleteDoubtSession);


export default router;