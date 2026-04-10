const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");
const User = require("../models/User");

async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token user." });
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  return next();
}

module.exports = { authRequired, adminOnly };

