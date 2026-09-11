// interview.routes.ts
// Defines URL paths for the Interview Simulator and connects each to its
// controller function. Multer here handles the optional resume PDF upload
// on /start — same memoryStorage + .single() pattern as Resume Analyzer's
// PDF upload and Doubt Solver's image upload, just a different field name.

import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/auth.middleware";
import {
  startInterview,
  submitAnswer,
  getInterviewSession,
  getInterviewHistory,
} from "../controllers/interview.controller";

const router = Router();

// memoryStorage (not diskStorage) — same choice as Resume Analyzer's
// upload, since the file only needs to pass through as a Buffer to
// pdf-parse and then get discarded; nothing here writes to disk.
const upload = multer({ storage: multer.memoryStorage() });

// Every route below requires a valid JWT — same pattern as
// roadmap.routes.ts and doubt.routes.ts.
router.use(protect);

// POST /api/interview/start — begin a new session. Resume is OPTIONAL:
// upload.single("resume") does NOT fail the request if no file is
// attached, it just leaves req.file undefined (identical reasoning to
// how doubt.routes.ts handles an optional image — see doubt.controller.ts's
// hasImage check).
router.post("/start", upload.single("resume"), startInterview);

// POST /api/interview/:sessionId/answer — the core evaluate-and-advance
// loop. No file upload here even for CODING-section turns — typed code
// travels as plain text in the transcript field, not as a file.
router.post("/:sessionId/answer", submitAnswer);

// GET /api/interview/history — lightweight list for a switcher/timeline
// panel, same shape as getRoadmapHistory. Placed BEFORE /:sessionId so
// Express doesn't try to match "history" as a sessionId param.
router.get("/history", getInterviewHistory);

// GET /api/interview/:sessionId — full turn history, for resuming an
// in-progress session or reviewing a completed one.
router.get("/:sessionId", getInterviewSession);

export default router;