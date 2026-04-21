const express = require("express");
const mongoose = require("mongoose");
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

const DEFAULT_ROOM_TIERS = [
  { tierName: "Standard", price: 14999, capacity: 2, amenities: ["WiFi"], availability: 20 },
  { tierName: "Deluxe", price: 19999, capacity: 2, amenities: ["WiFi", "Breakfast"], availability: 14 },
  { tierName: "Executive", price: 25999, capacity: 3, amenities: ["WiFi", "Breakfast", "Lounge"], availability: 8 },
  { tierName: "Suite", price: 32999, capacity: 4, amenities: ["WiFi", "Breakfast", "Lounge", "Premium View"], availability: 5 },
];

function parsePrice(value, fallback = 0) {
  const numeric = Number(String(value ?? fallback).replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function makeHotelPayload(data = {}) {
  return {
    name: data.name,
    location: data.location,
    description: data.description || "",
    image: data.image || "",
    amenities: Array.isArray(data.amenities) ? data.amenities : ["WiFi", "Breakfast", "Concierge"],
    activeStatus: true,
  };
}

async function ensureHotelInventory(hotelId, roomTiers = []) {
  const tiers = roomTiers.length ? roomTiers : DEFAULT_ROOM_TIERS;
  for (const tier of tiers) {
    await HotelRoom.findOneAndUpdate(
      { hotelId, tierName: tier.tierName },
      {
        hotelId,
        tierName: tier.tierName,
        price: parsePrice(tier.price, 14999),
        capacity: Number(tier.capacity || 2),
        amenities: Array.isArray(tier.amenities) ? tier.amenities : [],
        availability: Number(tier.availability || 10),
      },
      { upsert: true, new: true }
    );
  }
}

async function resolveHotelForBooking(hotelId, hotelData = {}) {
  if (mongoose.isValidObjectId(hotelId)) {
    return Hotel.findById(hotelId);
  }

  if (!hotelData?.name || !hotelData?.location) {
    return null;
  }

  let hotel = await Hotel.findOne({
    name: hotelData.name,
    location: hotelData.location,
  });

  if (!hotel) {
    hotel = await Hotel.create(makeHotelPayload(hotelData));
  } else if (!hotel.activeStatus) {
    hotel.activeStatus = true;
    hotel.image = hotel.image || hotelData.image || "";
    hotel.description = hotel.description || hotelData.description || "";
    await hotel.save();
  }

  await ensureHotelInventory(hotel._id, hotelData.roomTiers || []);
  return hotel;
}

async function resolveAirbnbForBooking(listingId, listingData = {}) {
  if (mongoose.isValidObjectId(listingId)) {
    return AirbnbListing.findById(listingId);
  }

  if (!listingData?.name || !listingData?.location) {
    return null;
  }

  let listing = await AirbnbListing.findOne({
    name: listingData.name,
    location: listingData.location,
  });

  if (!listing) {
    listing = await AirbnbListing.create({
      name: listingData.name,
      location: listingData.location,
      price: parsePrice(listingData.discountPrice || listingData.price, 19999),
      availability: Number(listingData.availability || 10),
      description: listingData.description || "",
      image: listingData.image || "",
      activeStatus: true,
    });
  } else if (!listing.activeStatus) {
    listing.activeStatus = true;
    listing.image = listing.image || listingData.image || "";
    listing.description = listing.description || listingData.description || "";
    if (listing.availability <= 0) {
      listing.availability = Number(listingData.availability || 10);
    }
    await listing.save();
  }

  return listing;
}

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
  if (booking.type === "package") {
    return {
      ...base,
      packageSlug: booking.packageSlug,
      packageTitle: booking.packageTitle,
      location: booking.packageLocation,
      travelers: booking.travelers,
      mealPreference: booking.mealPreference,
      pricePerPerson: booking.pricePerPerson,
      totalCost: booking.totalCost,
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
  if (!mongoose.isValidObjectId(flightId)) {
    return res.status(400).json({ message: "Selected flight is not available for live booking." });
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
  const { hotelId, roomTier, date, hotelData } = req.body;
  if (!hotelId || !roomTier || !date) {
    return res.status(400).json({ message: "hotelId, roomTier, date required." });
  }
  const hotel = await resolveHotelForBooking(hotelId, hotelData);
  if (!hotel) {
    return res.status(404).json({ message: "Hotel not found." });
  }
  const room = await HotelRoom.findOne({ hotelId: hotel._id, tierName: roomTier });
  if (!room || room.availability <= 0) {
    return res.status(409).json({ message: "Room tier unavailable." });
  }
  room.availability -= 1;
  await room.save();
  const booking = await Booking.create({
    bookingCode: generateBookingCode(),
    userId: req.user._id,
    type: "hotel",
    referenceId: hotel._id,
    date,
    roomTier,
    status: BOOKING_STATUS.PENDING,
  });
  return res.status(201).json({ booking: await getBookingDetail(booking) });
});

router.post("/airbnb", authRequired, async (req, res) => {
  const { listingId, date, listingData } = req.body;
  if (!listingId || !date) {
    return res.status(400).json({ message: "listingId and date required." });
  }
  const listing = await resolveAirbnbForBooking(listingId, listingData);
  if (!listing || !listing.activeStatus || listing.availability <= 0) {
    return res.status(409).json({ message: "Listing unavailable." });
  }
  listing.availability -= 1;
  await listing.save();
  const booking = await Booking.create({
    bookingCode: generateBookingCode(),
    userId: req.user._id,
    type: "airbnb",
    referenceId: listing._id,
    date,
    status: BOOKING_STATUS.PENDING,
  });
  return res.status(201).json({ booking: await getBookingDetail(booking) });
});

router.post("/package", authRequired, async (req, res) => {
  const {
    packageSlug,
    packageTitle,
    packageLocation,
    date,
    travelers,
    mealPreference,
    pricePerPerson,
    totalCost,
  } = req.body;

  if (!packageSlug || !packageTitle || !date) {
    return res.status(400).json({ message: "packageSlug, packageTitle, and date are required." });
  }

  const booking = await Booking.create({
    bookingCode: generateBookingCode(),
    userId: req.user._id,
    type: "package",
    date,
    travelers: Number(travelers || 1),
    mealPreference: mealPreference || "all",
    pricePerPerson: Number(pricePerPerson || 0),
    totalCost: Number(totalCost || 0),
    packageSlug,
    packageTitle,
    packageLocation: packageLocation || "",
    status: BOOKING_STATUS.PENDING,
    notes: "Pre-planned package booking",
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
