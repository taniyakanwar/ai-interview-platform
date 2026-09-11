// Import express to create our server
import express from "express";

// Import cors — allows frontend (on different port) to talk to this backend
import cors from "cors";

// Import dotenv — loads .env file so process.env variables are available
import dotenv from "dotenv";

// Load .env variables immediately — must happen before anything else
dotenv.config();

// Import passport — needed to initialize Google OAuth
import passport from "./config/passport";

// Import our route files
import authRoutes from "./routes/auth.routes";
import googleRoutes from "./routes/google.routes";

import noteRoutes from "./routes/note.routes";

import problemRoutes from "./routes/problem.routes";

import uploadRoutes from "./routes/upload.routes";

import resumeRoutes from "./routes/resume.routes";

import doubtRoutes from "./routes/doubt.routes";

import roadmapRoutes from "./routes/roadmap.routes"

import interviewRoutes from "./routes/interview.routes"

// Create the express app instance
const app = express();

// Read PORT from .env, fallback to 5000 if not set
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────
// Enable CORS, but only for a specific allowed origin instead of everyone.
// CORS_ORIGIN comes from an env var so it can be your live frontend URL in
// production, while still falling back to Vite's local dev address (5173)
// so nothing breaks when you're just running things on your own machine.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);

// Parse incoming JSON request bodies — without this, req.body would be undefined
app.use(express.json());

// Initialize passport — required before using any passport.authenticate calls
app.use(passport.initialize());

//problem
app.use("/api/problems", problemRoutes);

// ─── ROUTES ───────────────────────────────────────────────
// Health check route — just to confirm server is alive
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

app.use("/api/notes", noteRoutes);   // ← notes


// Auth routes — /api/auth/register, /api/auth/login, /api/auth/me
app.use("/api/auth", authRoutes);

// Google OAuth routes — /api/auth/google, /api/auth/google/callback
app.use("/api/auth", googleRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/resume", resumeRoutes);

app.use("/api/doubts", doubtRoutes);

app.use("/api/roadmap", roadmapRoutes);

app.use("/api/interview", interviewRoutes);

// ─── START SERVER ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});