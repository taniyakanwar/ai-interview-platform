// server/src/middleware/doubtUpload.ts

import multer from "multer";
import { Request } from "express";

// Memory storage (not diskStorage) — same choice as resumeUpload.ts.
// The file lands in req.file.buffer as a Buffer, never written to disk.
// Why this matters on free-tier hosting: ephemeral filesystems (Render,
// Railway free tiers) can wipe disk between requests, so writing to disk
// and reading it back later is fragile. Buffer -> Cloudinary in one request
// lifecycle sidesteps that entirely.
const storage = multer.memoryStorage();

// Whitelist of accepted MIME types. Note: this checks the MIME type the
// browser/client SENDS, not the actual file bytes — a malicious user could
// rename a .exe to .jpg and spoof the header. That's an acceptable risk here
// because Cloudinary itself re-validates and re-encodes the file on its end
// (it won't silently store/serve an executable as an "image"), so this
// filter is just a fast, cheap first line of defense, not the only one.
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // accept
  } else {
    // Passing an Error here makes multer forward it to Express's error
    // handler instead of silently dropping the file — same pattern
    // resumeUpload.ts uses for rejecting non-PDFs.
    cb(new Error("Only JPG, PNG, or WEBP images are allowed"));
  }
}

// 8MB ceiling — bumped up from resumeUpload.ts's 5MB. Reasoning: a PDF
// resume is text-dense and compresses well, but a phone camera photo of
// a textbook page or handwritten notes (which is EXACTLY our use case)
// routinely lands in the 3-7MB range straight out of the camera app,
// especially in good lighting/high resolution. 5MB would reject a fair
// chunk of real uploads before they even reach Gemini.
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB in bytes
});

// .single("image") — field name the frontend's FormData must use.
// We'll wire this exact string into doubtService.ts later, so it's a
// contract between this middleware and the frontend upload call.
export const uploadDoubtImage = upload.single("image");