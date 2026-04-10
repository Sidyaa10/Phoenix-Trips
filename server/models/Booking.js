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
    type: { type: String, enum: ["flight", "hotel", "airbnb"], required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    date: { type: String, required: true },
    seatNumber: { type: String, default: null },
    roomTier: { type: String, default: null },
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

