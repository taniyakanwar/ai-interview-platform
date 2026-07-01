// index.d.ts
// This file extends the default Express and Passport types
// to include our custom user fields (name, avatar, role etc.)
// Without this, TypeScript complains when we add extra fields to req.user

declare global {
  namespace Express {
    // Extending the Express User interface to include our custom fields
    interface User {
      userId: string   // our database user ID
      email: string    // user's email
      role: string     // USER or ADMIN
      name?: string    // full name (optional — might not exist for all auth methods)
      avatar?: string  // profile picture URL (optional)
    }
  }
}

// This empty export makes TypeScript treat this as a module
export {}