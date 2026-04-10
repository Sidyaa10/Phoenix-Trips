const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { jwtSecret } = require("../config");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

function buildToken(user) {
  return jwt.sign({ userId: user._id, role: user.role }, jwtSecret, {
    expiresIn: "7d",
  });
}

router.post(
  "/signup",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Invalid signup payload." });
      }
      const { name, email, password } = req.body;
      const normalizedEmail = String(email || "").toLowerCase().trim();
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({ message: "Email already exists." });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashed,
        role: "user",
      });
      const token = buildToken(user);
      return res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ message: "Email already exists." });
      }
      return res.status(500).json({ message: "Signup failed. Please try again." });
    }
  }
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Invalid login payload." });
      }
      const { email, password } = req.body;
      const normalizedEmail = String(email || "").toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) return res.status(401).json({ message: "Invalid credentials." });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: "Invalid credentials." });
      const token = buildToken(user);
      return res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      return res.status(500).json({ message: "Login failed. Please try again." });
    }
  }
);

router.get("/me", authRequired, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
