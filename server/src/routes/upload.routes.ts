// upload.routes.ts
import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/auth.middleware";
import { uploadImage } from "../controllers/upload.controller";

const router = Router();

// multer.memoryStorage() keeps the uploaded file in memory (as a Buffer)
// instead of writing it to disk - we don't need to persist it locally,
// since it's going straight to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per image - reasonable cap for note images
});

router.post("/image", protect, upload.single("image"), uploadImage);

export default router;