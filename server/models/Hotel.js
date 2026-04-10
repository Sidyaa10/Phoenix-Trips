const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, default: "" },
    amenities: { type: [String], default: [] },
    image: { type: String, default: "" },
    activeStatus: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);

