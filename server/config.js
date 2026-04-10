const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT || 5001,
  mongoUri:
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/phoenix-trips",
  jwtSecret: process.env.JWT_SECRET || "phoenix-trips-dev-secret",
  seatLockMinutes: 5,
};
