const express = require("express");
const Airline = require("../models/Airline");
const { authRequired, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(authRequired, adminOnly);

router.post("/airlines", async (req, res) => {
  const airline = await Airline.create(req.body);
  res.status(201).json({ airline });
});

router.put("/airlines/:id", async (req, res) => {
  const airline = await Airline.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!airline) return res.status(404).json({ message: "Airline not found." });
  res.json({ airline });
});

router.delete("/airlines/:id", async (req, res) => {
  await Airline.findByIdAndDelete(req.params.id);
  res.json({ message: "Airline removed." });
});

module.exports = router;

