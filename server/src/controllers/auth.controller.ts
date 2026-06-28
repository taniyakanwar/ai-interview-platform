import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../utils/jwt.utils";

// ─── REGISTER ───────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // 1. Check all fields are provided
    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    // 3. Hash the password (10 = salt rounds, higher = more secure but slower)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user in DB
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // 5. Sign a JWT token
    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      message: "Registration successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── LOGIN ──────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Check fields
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // 2. Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // 3. Compare password with hashed version in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // 4. Sign token
    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET ME ─────────────────────────────────────────────────
// This runs AFTER protect middleware — so req.user is already verified and populated
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get the userId from req.user — protect middleware attached this earlier
    const userId = (req.user as any)?.userId;

    // 2. Fetch the full user record from DB using that userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // Only return these fields — never send password back to frontend
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // 3. If no user found (edge case — token valid but user deleted from DB)
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 4. Return the user data
    res.status(200).json({ user });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};