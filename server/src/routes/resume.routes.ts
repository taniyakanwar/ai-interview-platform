import { Router } from "express";
import { protect } from "../middleware/auth.middleware"; // your existing Day 1-4 middleware
import { uploadResume } from "../middleware/resumeUpload";
import { analyzeResume, getResumeHistory, getResumeById } from "../controllers/resume.controller";

const router = Router();

router.post("/analyze", protect, uploadResume.single("resume"), analyzeResume);
router.get("/", protect, getResumeHistory);
router.get("/:id", protect, getResumeById);

export default router;