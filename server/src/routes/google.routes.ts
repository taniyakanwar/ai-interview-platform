// Import Router from express
import { Router } from "express";

// Import passport — we'll use it to trigger Google OAuth flow
import passport from "../config/passport";

// Import signToken — to generate JWT after Google login succeeds
import { signToken } from "../utils/jwt.utils";

// Create router instance
const router = Router();

// GET /api/auth/google — this is where the user is sent when they click "Login with Google"
// passport.authenticate triggers the Google OAuth flow — redirects user to Google's login page
// scope defines what info we're asking Google for — profile (name, avatar) and email
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// GET /api/auth/google/callback — Google redirects here after user logs in
// passport.authenticate runs again — this time it exchanges the code for user info
// and calls our GoogleStrategy function in passport.ts
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),

  // This runs only if passport.authenticate succeeded — req.user is now the user from DB
  (req, res) => {
    // 1. Get the user object that passport attached to req.user
    const user = req.user as any;

    // 2. Sign a JWT token for this user
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 3. Redirect to frontend with token in URL query param
    // Frontend will extract this token and store it
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
  }
);

// Export the router
export default router;