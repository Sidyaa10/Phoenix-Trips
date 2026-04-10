const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { connectDb } = require("./db");
const { port } = require("./config");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const metaRoutes = require("./routes/metaRoutes");
const flightRoutes = require("./routes/flightRoutes");
const stayRoutes = require("./routes/stayRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { releaseExpiredLocks } = require("./utils/seatService");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/stays", stayRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDb();
  setInterval(() => {
    releaseExpiredLocks().catch(() => {});
  }, 60 * 1000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Phoenix Trips API running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

