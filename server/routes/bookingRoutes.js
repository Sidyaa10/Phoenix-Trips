const express = require("express");
const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const FlightSeat = require("../models/FlightSeat");
const Hotel = require("../models/Hotel");
const HotelRoom = require("../models/HotelRoom");
const AirbnbListing = require("../models/AirbnbListing");
const User = require("../models/User");
const { authRequired, adminOnly } = require("../middleware/auth");
const { generateBookingCode, isPastDate } = require("../utils/booking");
const { BOOKING_STATUS, SEAT_STATUS, FLIGHT_STATUS } = require("../data/constants");

const router = express.Router();

async function getBookingDetail(booking) {
  const base = {
    id: booking._id,
    bookingCode: booking.bookingCode,
    type: booking.type,
    date: booking.date,
    seatNumber: booking.seatNumber,
    roomTier: booking.roomTier,
    status: booking.status,
    createdAt: booking.createdAt,
  };
  if (booking.type === "flight") {
    const flight = await Flight.findById(booking.referenceId).populate("airlineId");
    if (!flight) return base;
    return {
      ...base,
      airline: flight.airlineId ? flight.airlineId.name : "",
      flightNumber: flight.flightNumber,
      fromCity: flight.fromCity,
      toCity: flight.toCity,
      airportCodes: flight.airportCodes,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      flightStatus: flight.status,
    };
  }
  if (booking.type === "hotel") {
    const hotel = await Hotel.findById(booking.referenceId);
    return {
      ...base,
      hotelName: hotel?.name || "",
      location: hotel?.location || "",
    };
  }
  const listing = await AirbnbListing.findById(booking.referenceId);
  return {
    ...base,
    listingName: listing?.name || "",
    location: listing?.location || "",
  };
}

router.post("/flight", authRequired, async (req, res) => {
  const { flightId, date, seatNumber } = req.body;
  if (!flightId || !date || !seatNumber) {
    return res.status(400).json({ message: "flightId, date, seatNumber required." });
  }
  if (isPastDate(date)) return res.status(400).json({ message: "Past date not allowed." });
  const flight = await Flight.findById(flightId);
  if (!flight) return res.status(404).json({ message: "Flight not found." });
  const populatedFlight = await Flight.findById(flightId).populate("airlineId");
  if (!populatedFlight?.airlineId?.activeStatus) {
    return res.status(400).json({ message: "Selected airline is not active." });
  }
  if ([FLIGHT_STATUS.CANCELLED, FLIGHT_STATUS.FULLY_BOOKED].includes(flight.status)) {
    return res.status(400).json({ message: `Flight is ${flight.status}.` });
  }

  const seat = await FlightSeat.findOneAndUpdate(
    {
      flightId,
      date,
      seatNumber,
      status: SEAT_STATUS.LOCKED,
      lockedBy: req.user._id,
      lockExpiresAt: { $gt: new Date() },
    },
    {
      $set: {
        status: SEAT_STATUS.BOOKED,
        lockExpiresAt: null,
      },
    },
    { new: true }
  );
  if (!seat) {
    return res.status(409).json({ message: "Seat lock expired or unavailable." });
  }

  const booking = await Booking.create({
    bookingCode: generateBookingCode(),
    userId: req.user._id,
    type: "flight",
    referenceId: flightId,
    date,
    seatNumber,
    status:
      flight.status === FLIGHT_STATUS.DELAYED
        ? BOOKING_STATUS.DELAYED
        : BOOKING_STATUS.PENDING,
  });
  seat.bookingId = booking._id;
  await seat.save();
  return res.status(201).json({ booking: await getBookingDetail(booking) });
});

router.post("/hotel", authRequired, async (req, res) => {
  const { hotelId, roomTier, date } = req.body;
  if (!hotelId || !roomTier || !date) {
    return res.status(400).json({ message: "hotelId, roomTier, date required." });
  }
  const room = await HotelRoom.findOne({ hotelId, tierName: roomTier });
  if (!room || room.availability <= 0) {
    return res.status(409).json({ message: "Room tier unavailable." });
  }
  room.availability -= 1;
  await room.save();
  const booking = await Booking.create({
    bookingCode: generateBookingCode(),
    userId: req.user._id,
    type: "hotel",
    referenceId: hotelId,
    date,
    roomTier,
    status: BOOKING_STATUS.PENDING,
  });
  return res.status(201).json({ booking: await getBookingDetail(booking) });
});

router.post("/airbnb", authRequired, async (req, res) => {
  const { listingId, date } = req.body;
  if (!listingId || !date) {
    return res.status(400).json({ message: "listingId and date required." });
  }
  const listing = await AirbnbListing.findById(listingId);
  if (!listing || !listing.activeStatus || listing.availability <= 0) {
    return res.status(409).json({ message: "Listing unavailable." });
  }
  listing.availability -= 1;
  await listing.save();
  const booking = await Booking.create({
    bookingCode: generateBookingCode(),
    userId: req.user._id,
    type: "airbnb",
    referenceId: listingId,
    date,
    status: BOOKING_STATUS.PENDING,
  });
  return res.status(201).json({ booking: await getBookingDetail(booking) });
});

router.get("/", authRequired, async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const filter = isAdmin ? {} : { userId: req.user._id };
  const bookings = await Booking.find(filter).sort({ createdAt: -1 });
  const detailed = await Promise.all(bookings.map(getBookingDetail));
  res.json({ bookings: detailed });
});

router.patch("/:id/status", authRequired, adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!Object.values(BOOKING_STATUS).includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found." });
  booking.status = status;
  await booking.save();

  if (booking.type === "flight" && [BOOKING_STATUS.REJECTED, BOOKING_STATUS.CANCELLED].includes(status)) {
    await FlightSeat.findOneAndUpdate(
      { bookingId: booking._id },
      {
        $set: {
          status: SEAT_STATUS.AVAILABLE,
          bookingId: null,
          lockedBy: null,
          lockExpiresAt: null,
        },
      }
    );
  }
  if (booking.type === "hotel" && [BOOKING_STATUS.REJECTED, BOOKING_STATUS.CANCELLED].includes(status)) {
    await HotelRoom.findOneAndUpdate(
      { hotelId: booking.referenceId, tierName: booking.roomTier },
      { $inc: { availability: 1 } }
    );
  }
  if (booking.type === "airbnb" && [BOOKING_STATUS.REJECTED, BOOKING_STATUS.CANCELLED].includes(status)) {
    await AirbnbListing.findByIdAndUpdate(booking.referenceId, {
      $inc: { availability: 1 },
    });
  }
  res.json({ booking: await getBookingDetail(booking) });
});

router.get("/admin/users", authRequired, adminOnly, async (req, res) => {
  const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
  res.json({ users });
});

module.exports = router;
