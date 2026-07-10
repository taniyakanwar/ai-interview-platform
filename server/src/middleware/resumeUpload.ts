import multer from "multer";

// Memory storage — same pattern as your image upload from Day 11.
// We never write the file to disk; it goes straight from buffer to
// pdf-parse (for text) and Cloudinary (for storage) in the controller.
const storage = multer.memoryStorage();

export const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB — resumes are never legitimately bigger
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});