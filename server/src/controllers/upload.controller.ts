// upload.controller.ts
// Handles image uploads from the Notes editor - receives a file, uploads it
// to Cloudinary, and returns the hosted URL to save inside the note's content.

import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";

export const uploadImage = async (req: Request, res: Response) => {
  // multer (configured in the route file) puts the uploaded file on req.file
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Cloudinary's upload_stream lets us upload directly from memory (req.file.buffer)
    // without ever saving the file to disk first - faster and avoids leftover temp files
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "nook-notes" }, // organizes uploads under a folder in your Cloudinary dashboard
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file!.buffer);
    });

    res.status(201).json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    res.status(500).json({ message: "Image upload failed" });
  }
};