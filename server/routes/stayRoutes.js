const express = require("express");
const { body, validationResult } = require("express-validator");
const Hotel = require("../models/Hotel");
const HotelRoom = require("../models/HotelRoom");
const AirbnbListing = require("../models/AirbnbListing");
const { authRequired, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/hotels", async (req, res) => {
  const includeDisabled = req.query.includeDisabled === "true";
  const filter = includeDisabled ? {} : { activeStatus: true };
  const hotels = await Hotel.find(filter).sort({ name: 1 });
  const hotelIds = hotels.map((h) => h._id);
  const rooms = await HotelRoom.find({ hotelId: { $in: hotelIds } });
  const roomMap = rooms.reduce((acc, room) => {
    const key = String(room.hotelId);
    acc[key] = acc[key] || [];
    acc[key].push(room);
    return acc;
  }, {});
  res.json({
    hotels: hotels.map((h) => ({
      id: h._id,
      name: h.name,
      location: h.location,
      description: h.description,
      amenities: h.amenities,
      image: h.image,
      activeStatus: h.activeStatus,
      roomTiers: roomMap[String(h._id)] || [],
    })),
  });
});

router.post(
  "/hotels",
  authRequired,
  adminOnly,
  [body("name").notEmpty(), body("location").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid payload." });
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ hotel });
  }
);

router.put("/hotels/:id", authRequired, adminOnly, async (req, res) => {
  const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!hotel) return res.status(404).json({ message: "Hotel not found." });
  res.json({ hotel });
});

router.delete("/hotels/:id", authRequired, adminOnly, async (req, res) => {
  await Hotel.findByIdAndDelete(req.params.id);
  await HotelRoom.deleteMany({ hotelId: req.params.id });
  res.json({ message: "Hotel deleted." });
});

router.post(
  "/hotels/:id/rooms",
  authRequired,
  adminOnly,
  [body("tierName").notEmpty(), body("price").isNumeric(), body("availability").isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid room payload." });
    const room = await HotelRoom.findOneAndUpdate(
      { hotelId: req.params.id, tierName: req.body.tierName },
      { ...req.body, hotelId: req.params.id },
      { upsert: true, new: true }
    );
    res.status(201).json({ room });
  }
);

router.put("/rooms/:roomId", authRequired, adminOnly, async (req, res) => {
  const room = await HotelRoom.findByIdAndUpdate(req.params.roomId, req.body, { new: true });
  if (!room) return res.status(404).json({ message: "Room tier not found." });
  res.json({ room });
});

router.delete("/rooms/:roomId", authRequired, adminOnly, async (req, res) => {
  await HotelRoom.findByIdAndDelete(req.params.roomId);
  res.json({ message: "Room tier deleted." });
});

router.get("/airbnbs", async (req, res) => {
  const includeDisabled = req.query.includeDisabled === "true";
  const filter = includeDisabled ? {} : { activeStatus: true };
  const listings = await AirbnbListing.find(filter).sort({ name: 1 });
  res.json({ listings });
});

router.post("/airbnbs", authRequired, adminOnly, async (req, res) => {
  const listing = await AirbnbListing.create(req.body);
  res.status(201).json({ listing });
});

router.put("/airbnbs/:id", authRequired, adminOnly, async (req, res) => {
  const listing = await AirbnbListing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!listing) return res.status(404).json({ message: "Listing not found." });
  res.json({ listing });
});

router.delete("/airbnbs/:id", authRequired, adminOnly, async (req, res) => {
  await AirbnbListing.findByIdAndDelete(req.params.id);
  res.json({ message: "Listing deleted." });
});

module.exports = router;

