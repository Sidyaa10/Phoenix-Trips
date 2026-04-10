const mongoose = require("mongoose");

const airbnbListingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    availability: { type: Number, required: true, default: 0 },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    activeStatus: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AirbnbListing", airbnbListingSchema);

