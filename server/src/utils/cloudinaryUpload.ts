// server/src/utils/cloudinaryUpload.ts  (new file, or add to an existing utils file if you have one)

import cloudinary from "../config/cloudinary"; // 

/**
 * Uploads an image buffer to Cloudinary and returns the secure URL.
 * Mirrors uploadPdfToCloudinary's upload_stream pattern, but with
 * resource_type: "image" instead of "raw" — this matters because
 * Cloudinary treats images and raw files differently under the hood
 * (images get automatic optimization, format detection, and
 * on-the-fly transformations available; "raw" is just dumb byte storage,
 * which is correct for a PDF resume but wrong for a photo).
 */
export function uploadImageToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder, // e.g. "nook/doubt-images" — keeps  separate from "nook/resumes" and "nook/notes" in  Cloudinary media library
        resource_type: "image",
        // Cloudinary auto-detects format (jpg/png/webp) and can
        // downsize huge camera photos on the fly later via URL params
        // if you ever need thumbnails in the sidebar — no extra work now.
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve(result.secure_url);
      }
    );

    // Same trick as uploadPdfToCloudinary: multer gives us a Buffer
    // (from memoryStorage), but upload_stream wants a stream, so we
    // pipe the buffer through it. end(buffer) writes-then-closes in
    // one call — this is the standard bridge between "I have bytes in
    // memory" and "Cloudinary's SDK wants a stream."
    uploadStream.end(buffer);
  });
}