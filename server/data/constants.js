const CITY_AIRPORTS = {
  Mumbai: "BOM",
  Hawaii: "HNL",
  Singapore: "SIN",
  Wellington: "WLG",
  Melbourne: "MEL",
  Jeddah: "JED",
  Dubai: "DXB",
  Napoli: "NAP",
  Nice: "NCE",
  Paris: "CDG",
  Bali: "DPS",
  "Jeju-do": "CJU",
  Jaipur: "JAI",
  Madrid: "MAD",
  Edinburgh: "EDI",
  Madeira: "FNC",
  Mykono: "JMK",
  Milan: "MXP",
  Monaco: "MCM",
  Okinawa: "OKA",
};

const BOOKING_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  DELAYED: "Delayed",
};

const FLIGHT_STATUS = {
  ACTIVE: "Active",
  DELAYED: "Delayed",
  CANCELLED: "Cancelled",
  FULLY_BOOKED: "Fully Booked",
};

const SEAT_STATUS = {
  AVAILABLE: "available",
  LOCKED: "locked",
  BOOKED: "booked",
};

function buildDefaultSeatMap() {
  const seats = [];
  for (let row = 1; row <= 6; row += 1) {
    ["A", "B", "C", "D"].forEach((col) => {
      seats.push({ seatNumber: `${row}${col}`, class: "Business" });
    });
  }
  for (let row = 7; row <= 30; row += 1) {
    ["A", "B", "C", "D", "E", "F"].forEach((col) => {
      seats.push({ seatNumber: `${row}${col}`, class: "Economy" });
    });
  }
  return seats;
}

module.exports = {
  CITY_AIRPORTS,
  BOOKING_STATUS,
  FLIGHT_STATUS,
  SEAT_STATUS,
  buildDefaultSeatMap,
};

