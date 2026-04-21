const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function ensureAdminUser() {
  const email = "sid@gmail.com";
  const hashed = await bcrypt.hash("sidkadam", 10);
  const existing = await User.findOne({ email });

  if (existing) {
    existing.password = hashed;
    existing.role = "admin";
    existing.name = existing.name || "Sid Admin";
    await existing.save();
    return existing;
  }

  return User.create({
    name: "Sid Admin",
    email,
    password: hashed,
    role: "admin",
  });
}

module.exports = {
  ensureAdminUser,
};
