const mongoose = require("mongoose");

const hotelRoomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },
    tierName: {
      type: String,
      enum: ["Standard", "Deluxe", "Executive", "Suite"],
      required: true,
    },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true, default: 2 },
    amenities: { type: [String], default: [] },
    availability: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

hotelRoomSchema.index(
  { hotelId: 1, tierName: 1 },
  { unique: true, name: "unique_hotel_tier" }
);

module.exports = mongoose.model("HotelRoom", hotelRoomSchema);

