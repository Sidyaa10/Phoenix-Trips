const express = require("express");
const { body, validationResult } = require("express-validator");
const Flight = require("../models/Flight");
const Airline = require("../models/Airline");
const FlightSeat = require("../models/FlightSeat");
const { authRequired, adminOnly } = require("../middleware/auth");
const {
  CITY_AIRPORTS,
  FLIGHT_STATUS,
  SEAT_STATUS,
} = require("../data/constants");
const { isPastDate } = require("../utils/booking");
const { ensureSeatInventory, releaseExpiredLocks } = require("../utils/seatService");
const { seatLockMinutes } = require("../config");

const router = express.Router();

function validateCityPair(fromCity, toCity) {
  return (
    CITY_AIRPORTS[fromCity] &&
    CITY_AIRPORTS[toCity] &&
    fromCity !== toCity
  );
}

function serializeFlight(flight) {
  return {
    id: flight._id,
    flightNumber: flight.flightNumber,
    fromCity: flight.fromCity,
    toCity: flight.toCity,
    airportCodes: flight.airportCodes,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
    duration: flight.duration,
    basePrice: flight.basePrice,
    status: flight.status,
    airline: flight.airlineId,
  };
}

router.get("/", async (req, res) => {
  const { fromCity, toCity } = req.query;
  const filter = {};
  if (fromCity) filter.fromCity = fromCity;
  if (toCity) filter.toCity = toCity;
  const flights = await Flight.find(filter).populate("airlineId");
  const data = flights
    .filter((f) => f.airlineId && f.airlineId.activeStatus)
    .map(serializeFlight);
  res.json({ flights: data });
});

router.post(
  "/",
  authRequired,
  adminOnly,
  [
    body("flightNumber").notEmpty(),
    body("fromCity").notEmpty(),
    body("toCity").notEmpty(),
    body("airlineId").notEmpty(),
    body("departureTime").notEmpty(),
    body("arrivalTime").notEmpty(),
    body("duration").notEmpty(),
    body("basePrice").isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid flight payload." });
    }
    const {
      flightNumber,
      fromCity,
      toCity,
      airlineId,
      departureTime,
      arrivalTime,
      duration,
      basePrice,
      status,
    } = req.body;
    if (!validateCityPair(fromCity, toCity)) {
      return res.status(400).json({ message: "Unsupported city route." });
    }
    const airline = await Airline.findById(airlineId);
    if (!airline) {
      return res.status(404).json({ message: "Airline not found." });
    }
    const flight = await Flight.create({
      flightNumber,
      fromCity,
      toCity,
      airportCodes: { from: CITY_AIRPORTS[fromCity], to: CITY_AIRPORTS[toCity] },
      airlineId,
      departureTime,
      arrivalTime,
      duration,
      basePrice,
      status: status || FLIGHT_STATUS.ACTIVE,
    });
    const populated = await Flight.findById(flight._id).populate("airlineId");
    return res.status(201).json({ flight: serializeFlight(populated) });
  }
);

router.put("/:id", authRequired, adminOnly, async (req, res) => {
  const payload = { ...req.body };
  if (payload.fromCity || payload.toCity) {
    const current = await Flight.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Flight not found." });
    const fromCity = payload.fromCity || current.fromCity;
    const toCity = payload.toCity || current.toCity;
    if (!validateCityPair(fromCity, toCity)) {
      return res.status(400).json({ message: "Unsupported city route." });
    }
    payload.airportCodes = { from: CITY_AIRPORTS[fromCity], to: CITY_AIRPORTS[toCity] };
  }
  const flight = await Flight.findByIdAndUpdate(req.params.id, payload, {
    new: true,
  }).populate("airlineId");
  if (!flight) return res.status(404).json({ message: "Flight not found." });
  return res.json({ flight: serializeFlight(flight) });
});

router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  await Flight.findByIdAndDelete(req.params.id);
  await FlightSeat.deleteMany({ flightId: req.params.id });
  res.json({ message: "Flight removed." });
});

router.get("/:id/seats", async (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ message: "date is required." });
  if (isPastDate(date)) return res.status(400).json({ message: "Past date is not allowed." });
  const flight = await Flight.findById(req.params.id);
  if (!flight) return res.status(404).json({ message: "Flight not found." });
  await ensureSeatInventory(flight._id, date);
  await releaseExpiredLocks();
  const seats = await FlightSeat.find({ flightId: flight._id, date }).sort({ seatNumber: 1 });
  const normalizedSeats = seats.map((seat) => {
    const lockedExpired =
      seat.status === SEAT_STATUS.LOCKED &&
      seat.lockExpiresAt &&
      seat.lockExpiresAt <= new Date();
    return {
      seatNumber: seat.seatNumber,
      class: seat.class,
      status: lockedExpired ? SEAT_STATUS.AVAILABLE : seat.status,
    };
  });
  return res.json({
    flightStatus: flight.status,
    seats: normalizedSeats,
  });
});

router.post("/:id/seats/lock", authRequired, async (req, res) => {
  const { date, seatNumber } = req.body;
  if (!date || !seatNumber) {
    return res.status(400).json({ message: "date and seatNumber are required." });
  }
  if (isPastDate(date)) return res.status(400).json({ message: "Past date is not allowed." });
  const flight = await Flight.findById(req.params.id);
  if (!flight) return res.status(404).json({ message: "Flight not found." });
  if ([FLIGHT_STATUS.CANCELLED, FLIGHT_STATUS.FULLY_BOOKED].includes(flight.status)) {
    return res.status(400).json({ message: `Flight is ${flight.status}.` });
  }
  await ensureSeatInventory(flight._id, date);
  await releaseExpiredLocks();
  const lockUntil = new Date(Date.now() + seatLockMinutes * 60 * 1000);
  const seat = await FlightSeat.findOneAndUpdate(
    {
      flightId: flight._id,
      date,
      seatNumber,
      $or: [
        { status: SEAT_STATUS.AVAILABLE },
        { status: SEAT_STATUS.LOCKED, lockExpiresAt: { $lte: new Date() } },
        { status: SEAT_STATUS.LOCKED, lockedBy: req.user._id },
      ],
    },
    {
      $set: {
        status: SEAT_STATUS.LOCKED,
        lockedBy: req.user._id,
        lockExpiresAt: lockUntil,
      },
    },
    { new: true }
  );
  if (!seat) {
    return res.status(409).json({ message: "Seat already booked/locked." });
  }
  return res.json({
    message: "Seat locked",
    seat: { seatNumber: seat.seatNumber, class: seat.class, status: seat.status },
    lockExpiresAt: lockUntil,
  });
});

router.post("/:id/seats/release", authRequired, async (req, res) => {
  const { date, seatNumber } = req.body;
  await FlightSeat.findOneAndUpdate(
    {
      flightId: req.params.id,
      date,
      seatNumber,
      status: SEAT_STATUS.LOCKED,
      lockedBy: req.user._id,
    },
    {
      $set: {
        status: SEAT_STATUS.AVAILABLE,
        lockedBy: null,
        lockExpiresAt: null,
      },
    }
  );
  return res.json({ message: "Seat released." });
});

router.post("/:id/seats/reset", authRequired, adminOnly, async (req, res) => {
  const date = req.body.date;
  if (!date) return res.status(400).json({ message: "date is required." });
  await FlightSeat.updateMany(
    { flightId: req.params.id, date },
    {
      $set: {
        status: SEAT_STATUS.AVAILABLE,
        bookingId: null,
        lockedBy: null,
        lockExpiresAt: null,
      },
    }
  );
  res.json({ message: "Seat map reset done." });
});

router.post("/:id/seats/override", authRequired, adminOnly, async (req, res) => {
  const { date, seatNumber, status } = req.body;
  if (!date || !seatNumber || !status) {
    return res.status(400).json({ message: "date, seatNumber, status required." });
  }
  const seat = await FlightSeat.findOneAndUpdate(
    { flightId: req.params.id, date, seatNumber },
    {
      $set: {
        status,
        lockExpiresAt: null,
        lockedBy: null,
      },
    },
    { new: true }
  );
  if (!seat) return res.status(404).json({ message: "Seat not found." });
  res.json({ seat });
});

module.exports = router;

