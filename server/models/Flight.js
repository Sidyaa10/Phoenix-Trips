const mongoose = require("mongoose");
const { FLIGHT_STATUS, buildDefaultSeatMap } = require("../data/constants");

const flightSchema = new mongoose.Schema(
  {
    flightNumber: { type: String, required: true, unique: true, trim: true },
    fromCity: { type: String, required: true },
    toCity: { type: String, required: true },
    airportCodes: {
      from: { type: String, required: true },
      to: { type: String, required: true },
    },
    airlineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Airline",
      required: true,
    },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: String, required: true },
    basePrice: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(FLIGHT_STATUS),
      default: FLIGHT_STATUS.ACTIVE,
    },
    seatTemplate: {
      type: [
        {
          seatNumber: String,
          class: { type: String, enum: ["Economy", "Business"] },
        },
      ],
      default: buildDefaultSeatMap,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Flight", flightSchema);

