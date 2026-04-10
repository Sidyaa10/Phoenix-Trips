const Flight = require("../models/Flight");
const FlightSeat = require("../models/FlightSeat");
const { SEAT_STATUS } = require("../data/constants");

async function releaseExpiredLocks() {
  await FlightSeat.updateMany(
    {
      status: SEAT_STATUS.LOCKED,
      lockExpiresAt: { $lte: new Date() },
    },
    {
      $set: {
        status: SEAT_STATUS.AVAILABLE,
        lockedBy: null,
        lockExpiresAt: null,
      },
    }
  );
}

async function ensureSeatInventory(flightId, date) {
  const existingCount = await FlightSeat.countDocuments({ flightId, date });
  if (existingCount > 0) {
    return;
  }
  const flight = await Flight.findById(flightId);
  if (!flight) return;
  const seats = flight.seatTemplate.map((seat) => ({
    flightId,
    date,
    seatNumber: seat.seatNumber,
    class: seat.class,
    status: SEAT_STATUS.AVAILABLE,
  }));
  if (seats.length) {
    await FlightSeat.insertMany(seats, { ordered: false }).catch(() => {});
  }
}

module.exports = { releaseExpiredLocks, ensureSeatInventory };

