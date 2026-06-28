// Import express to create our server
import express from "express";

// Import cors — allows frontend (on different port) to talk to this backend
import cors from "cors";

// Import dotenv — loads .env file so process.env variables are available
import dotenv from "dotenv";

// Import our auth router — contains /register and /login routes
import authRoutes from "./routes/auth.routes";

// Load .env variables immediately before anything else runs
dotenv.config();

// Create the express app instance
const app = express();

// Read PORT from .env, fallback to 5000 if not set
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────
// Enable CORS so React frontend can make requests to this server
app.use(cors());

// Parse incoming JSON request bodies — without this, req.body would be undefined
app.use(express.json());

// ─── ROUTES ───────────────────────────────────────────────
// Health check route — just to confirm server is alive
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

// Mount auth routes at /api/auth — so URLs become:
// POST /api/auth/register
// POST /api/auth/login
app.use("/api/auth", authRoutes);

// ─── START SERVER ─────────────────────────────────────────
// Start listening for incoming requests on the specified PORT
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});