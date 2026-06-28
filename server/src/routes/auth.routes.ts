// Import Router from express — it lets us define route groups separately
import { Router } from "express";

// Import controller functions
import { register, login, getMe } from "../controllers/auth.controller";

// Import protect middleware — used to guard routes that require login
import { protect } from "../middleware/auth.middleware";

// Create a new router instance
const router = Router();

// POST /api/auth/register — public route, no token needed
router.post("/register", register);

// POST /api/auth/login — public route, no token needed
router.post("/login", login);

// GET /api/auth/me — protected route, token required
// protect runs first, then getMe — if protect fails, getMe never runs
router.get("/me", protect, getMe);

// Export the router so index.ts can use it
export default router;