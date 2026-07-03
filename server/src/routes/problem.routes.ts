// problem.routes.ts
// Defines URL paths for Coding Practice and connects each to its controller function.
// ALL routes here require login — reusing the same authMiddleware from your auth.routes.ts.

import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import {
  getAllProblems,
  getProblemBySlug,
  createProblem,
  updateProgress,
} from "../controllers/problem.controller";

const router = Router();

// Every route below runs protect FIRST — if there's no valid JWT, it stops here.
router.get("/", protect, getAllProblems);
router.get("/:slug", protect, getProblemBySlug);
router.post("/", protect, createProblem);
router.patch("/:id/progress", protect, updateProgress);

export default router;