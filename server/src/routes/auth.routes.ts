// Import Router from express — it lets us define route groups separately
import { Router } from "express";

// Import the controller functions we wrote in auth.controller.ts
import { register, login } from "../controllers/auth.controller";

// Create a new router instance — think of it as a mini express app just for auth routes
const router = Router();

// POST /api/auth/register — when someone hits this URL, run the register function
router.post("/register", register);

// POST /api/auth/login — when someone hits this URL, run the login function
router.post("/login", login);

// Export the router so index.ts can plug it in
export default router;