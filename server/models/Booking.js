const mongoose = require("mongoose");
const { BOOKING_STATUS } = require("../data/constants");

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, enum: ["flight", "hotel", "airbnb", "package"], required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    date: { type: String, required: true },
    seatNumber: { type: String, default: null },
    roomTier: { type: String, default: null },
    travelers: { type: Number, default: 1 },
    mealPreference: { type: String, default: "" },
    totalCost: { type: Number, default: 0 },
    pricePerPerson: { type: Number, default: 0 },
    packageSlug: { type: String, default: "" },
    packageTitle: { type: String, default: "" },
    packageLocation: { type: String, default: "" },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
