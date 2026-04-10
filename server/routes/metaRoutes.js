const express = require("express");
const Airline = require("../models/Airline");
const { CITY_AIRPORTS } = require("../data/constants");

const router = express.Router();

router.get("/cities", (req, res) => {
  const cities = Object.entries(CITY_AIRPORTS).map(([city, airportCode]) => ({
    city,
    airportCode,
  }));
  res.json({ cities });
});

router.get("/airlines", async (req, res) => {
  const includeDisabled = req.query.includeDisabled === "true";
  const filter = includeDisabled ? {} : { activeStatus: true };
  const airlines = await Airline.find(filter).sort({ name: 1 });
  res.json({ airlines });
});

module.exports = router;

