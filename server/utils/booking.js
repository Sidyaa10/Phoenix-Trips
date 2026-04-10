const { v4: uuidv4 } = require("uuid");

function generateBookingCode() {
  return `PHX-${uuidv4().split("-")[0].toUpperCase()}`;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function isPastDate(yyyyMmDd) {
  return yyyyMmDd < todayString();
}

module.exports = { generateBookingCode, todayString, isPastDate };

