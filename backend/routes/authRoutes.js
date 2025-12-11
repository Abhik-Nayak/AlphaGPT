import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const router = express.Router();

const createToken = (userId) => {
  console.log(`[AUTH] Creating JWT for user ID: ${userId}`);
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

router.post("/register", async (req, res) => {
  console.log("[REGISTER] Incoming request:", req.body);

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      console.log("[REGISTER] Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log(`[REGISTER] Checking existing user for email: ${email}`);
    const existing = await User.findOne({ email });

    if (existing) {
      console.log(`[REGISTER] Email already in use: ${email}`);
      return res.status(400).json({ error: "Email already in use" });
    }

    console.log("[REGISTER] Creating new user...");
    const user = await User.create({ email, password, name });

    const token = createToken(user._id);

    console.log(`[REGISTER] User created successfully: ${user._id}`);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("[REGISTER] Error occurred:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  console.log("[LOGIN] Incoming request:", req.body);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("[LOGIN] Missing email or password");
      return res.status(400).json({ error: "Missing email or password" });
    }

    console.log(`[LOGIN] Looking up user by email: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.log("[LOGIN] User not found");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log("[LOGIN] Comparing password...");
    const valid = await user.comparePassword(password);

    if (!valid) {
      console.log("[LOGIN] Invalid password for user:", user._id);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = createToken(user._id);

    console.log(`[LOGIN] Login successful for user: ${user._id}`);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("[LOGIN] Error occurred:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
