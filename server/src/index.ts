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

// Create the express app instance
const app = express();

// Read PORT from .env, fallback to 5000 if not set
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────
// Enable CORS so React frontend can make requests to this backend
app.use(cors());

// Parse incoming JSON request bodies — without this, req.body would be undefined
app.use(express.json());

// Initialize passport — required before using any passport.authenticate calls
app.use(passport.initialize());

// ─── ROUTES ───────────────────────────────────────────────
// Health check route — just to confirm server is alive
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

// Auth routes — /api/auth/register, /api/auth/login, /api/auth/me
app.use("/api/auth", authRoutes);

// Google OAuth routes — /api/auth/google, /api/auth/google/callback
app.use("/api/auth", googleRoutes);

// ─── START SERVER ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});