import { Request, Response } from "express";
import { prisma } from "../lib/prisma"; // adjust to your actual client path
import cloudinary from "../config/cloudinary"; // your existing Day 11 config
import { extractTextFromPdf } from "../utils/pdfExtractor";
import { calculateAtsScore, getMissingSkills } from "../utils/atsScoring";
import { generateResumeSuggestions } from "../utils/resumeAi";
import { Prisma } from "../generated/prisma/client";

// Uploads a raw (non-image) buffer to Cloudinary. Mirrors your Day 11
// upload_stream-wrapped-in-a-Promise pattern, but resource_type: "raw"
// instead of "image" — Cloudinary treats PDFs as generic files, not images,
// so they need this distinct handling or the upload silently mishandles them.
function uploadPdfToCloudinary(buffer: Buffer, fileName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", public_id: `resumes/${Date.now()}-${fileName}` },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export async function analyzeResume(req: Request, res: Response) {
  try {
    const userId = req.user?.userId; // matches the OAuth bug fix from Day 8-10 — userId, not id
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const { targetJD } = req.body; // optional, from multipart form field

    // Step 1: extract text — everything downstream depends on this succeeding
    const extractedText = await extractTextFromPdf(req.file.buffer);

    // Step 2: rule-based score — instant, no external dependency, always succeeds
    const { atsScore, scoreBreakdown } = calculateAtsScore(extractedText, targetJD);
    const missingSkills = getMissingSkills(extractedText, targetJD);

    // Step 3: AI suggestions and Cloudinary upload run independently —
    // neither depends on the other's result, so run them concurrently
    // instead of sequentially to cut total request time roughly in half.
    const [suggestions, fileUrl] = await Promise.all([
      generateResumeSuggestions(extractedText, targetJD),
      uploadPdfToCloudinary(req.file.buffer, req.file.originalname),
    ]);

    // Step 4: persist everything as one snapshot row
    const resume = await prisma.resume.create({
      data: {
        userId,
        fileUrl,
        fileName: req.file.originalname,
        extractedText,
        targetJD: targetJD || null,
        atsScore,
        scoreBreakdown:scoreBreakdown as Prisma.InputJsonValue,
        missingSkills,
        suggestions :suggestions as unknown as Prisma.InputJsonValue
      },
    });

    return res.status(201).json(resume);
  } catch (err) {
    console.error("Resume analysis failed:", err);
    const message =
      err instanceof Error ? err.message : "Failed to analyze resume";
    return res.status(500).json({ message });
  }
}

export async function getResumeHistory(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        atsScore: true,
        targetJD: true,
        createdAt: true,
        // extractedText/suggestions omitted here — history list doesn't
        // need the full payload, keeps the response light
      },
    });

    return res.json(resumes);
  } catch (err) {
    console.error("Failed to fetch resume history:", err);
    return res.status(500).json({ message: "Failed to fetch resume history" });
  }
}

export async function getResumeById(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const resume = await prisma.resume.findUnique({
      where: { id: req.params.id as string },
    });

    if (!resume || resume.userId !== userId) {
      // Same check whether it's missing or belongs to someone else —
      // don't leak existence of other users' resumes via a different error.
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.json(resume);
  } catch (err) {
    console.error("Failed to fetch resume:", err);
    return res.status(500).json({ message: "Failed to fetch resume" });
  }
}