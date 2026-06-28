// Import passport — the authentication middleware for Node.js
import passport from "passport";

// Import the Google OAuth 2.0 strategy for passport
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Import prisma to find or create users in DB
import { prisma } from "../lib/prisma";

// Configure the Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      // Your Google app credentials from .env
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

      // The URL Google will redirect to after user logs in
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },

    // This function runs after Google confirms the user's identity
    // profile = all the user info Google gives us (name, email, avatar, googleId)
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Extract email from Google profile
        const email = profile.emails?.[0].value;

        // 2. If Google didn't provide an email, we can't proceed
        if (!email) {
          return done(new Error("No email from Google"), undefined);
        }

        // 3. Check if a user with this email already exists in our DB
        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          // 4a. User exists — update their googleId and avatar if not set yet
          user = await prisma.user.update({
            where: { email },
            data: {
              // Save Google's ID so we can identify them next time
              googleId: profile.id,
              // Save their Google profile picture as avatar
              avatar: profile.photos?.[0].value,
              // Mark as verified since Google already verified their email
              isVerified: true,
            },
          });
        } else {
          // 4b. New user — create them in DB with Google info
          user = await prisma.user.create({
            data: {
              name: profile.displayName,        // Full name from Google
              email,                             // Email from Google
              googleId: profile.id,              // Google's unique ID for this user
              avatar: profile.photos?.[0].value, // Profile picture URL
              isVerified: true,                  // Google already verified their email
              // No password — they're using Google to login
            },
          });
        }

        // 5. Map prisma user to JwtPayload shape — id becomes userId
        // This is needed because our JwtPayload uses userId, not id
        return done(null, { userId: user.id, email: user.email, role: user.role });

      } catch (error) {
        // If anything went wrong, pass the error to passport
        return done(error, undefined);
      }
    }
  )
);

// Export passport so we can use it in index.ts
export default passport;