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

    // 3. Build a clean user object to send to the frontend
    // We only send safe, public fields — never send passwords or sensitive data
    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };

    // 4. Convert the user object to a JSON string, then URL-encode it
    // URL-encoding is necessary because the object contains special characters
    // like { } " that would break the URL if sent raw
    const userParam = encodeURIComponent(JSON.stringify(userPayload));

    // 5. Redirect to frontend with BOTH token and user data in the URL
    // Frontend's GoogleCallback page will read both of these
    res.redirect(`http://localhost:5173/auth/callback?token=${token}&user=${userParam}`);
  }
);

// Export the router
export default router;