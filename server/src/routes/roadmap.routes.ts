// roadmap.routes.ts
// Defines URL paths for the Roadmap Generator and connects each to its
// controller function. All routes require login.

import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import {
  getRoadmapSuggestions,
  generateNewRoadmap,
  getActiveRoadmap,
  getRoadmapHistory,
  activateRoadmap,
  toggleTask,
  deleteRoadmap,
} from "../controllers/roadmap.controller";

const router = Router();

// Every route below requires a valid JWT — protect runs first and
// attaches req.user, same pattern as doubt.routes.ts.
router.use(protect);

// GET /api/roadmap/suggestions — pre-fill weak topics before generating,
// read-only, nothing saved. Placed BEFORE /:roadmapId-style routes below
// so Express doesn't try to match "suggestions" as a roadmapId param.
router.get("/suggestions", getRoadmapSuggestions);

// GET /api/roadmap/active — the main roadmap view (graph + accordion)
router.get("/active", getActiveRoadmap);

// GET /api/roadmap/history — lightweight list for the history/switcher UI
router.get("/history", getRoadmapHistory);

// POST /api/roadmap/generate — create a new roadmap (calls Gemini, then saves)
router.post("/generate", generateNewRoadmap);

// PATCH /api/roadmap/task/:taskId/toggle — the checkbox click.
// Placed above /:roadmapId/activate since "task" is a fixed segment, not
// a param, but kept explicit for readability alongside the other PATCH route.
router.patch("/task/:taskId/toggle", toggleTask);

// PATCH /api/roadmap/:roadmapId/activate — switch which roadmap is active
router.patch("/:roadmapId/activate", activateRoadmap);

// DELETE /api/roadmap/:roadmapId — remove a roadmap from history
router.delete("/:roadmapId", deleteRoadmap);

export default router;