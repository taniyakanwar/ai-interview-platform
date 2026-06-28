// Import types from express — Request, Response, NextFunction are the 3 params every middleware gets
import { Request, Response, NextFunction } from "express";

// Import our verifyToken helper to decode and validate the JWT
import { verifyToken, JwtPayload } from "../utils/jwt.utils";

// Extend express's Request type to include a 'user' field
// By default, req.user doesn't exist in express — we're adding it ourselves
// Tell TypeScript that Passport's User type IS our JwtPayload
// This merges our type with Passport's existing declaration — no conflict
declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}

// This is the middleware function — it runs BEFORE the actual route handler
// next() means "okay, move on to the next function in the chain"
export const protect = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 1. Get the Authorization header — it looks like: "Bearer eyJhbGci..."
    const authHeader = req.headers.authorization;

    // 2. If no header provided, or it doesn't start with "Bearer", reject the request
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    // 3. Extract just the token part — split "Bearer eyJhbGci..." into ["Bearer", "eyJhbGci..."]
    // and take index [1] which is the actual token
    const token = authHeader.split(" ")[1];

    // 4. Verify the token — if it's invalid or expired, this will throw an error
    const decoded = verifyToken(token);

    // 5. Attach the decoded user data to req.user so the next function can use it
    req.user = decoded;

    // 6. Call next() to pass control to the actual route handler
    next();
  } catch (error) {
    // If verifyToken threw an error, the token is invalid or expired
    res.status(401).json({ message: "Invalid or expired token" });
  }
};