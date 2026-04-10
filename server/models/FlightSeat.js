const mongoose = require("mongoose");
const { SEAT_STATUS } = require("../data/constants");

const flightSeatSchema = new mongoose.Schema(
  {
    flightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
      index: true,
    },
    date: { type: String, required: true, index: true },
    seatNumber: { type: String, required: true },
    class: { type: String, enum: ["Economy", "Business"], required: true },
    status: {
      type: String,
      enum: Object.values(SEAT_STATUS),
      default: SEAT_STATUS.AVAILABLE,
      index: true,
    },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    lockExpiresAt: { type: Date, default: null, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
  },
  { timestamps: true }
);

flightSeatSchema.index(
  { flightId: 1, date: 1, seatNumber: 1 },
  { unique: true, name: "unique_flight_date_seat" }
);

module.exports = mongoose.model("FlightSeat", flightSeatSchema);

