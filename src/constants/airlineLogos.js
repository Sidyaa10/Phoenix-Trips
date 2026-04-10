export const AIRLINE_LOGOS = {
  Emirates: "/airlinesandhotels/emirates.svg",
  "Etihad Airways": "/airlinesandhotels/etihadairways.svg",
  "Qatar Airways": "/airlinesandhotels/qatarairways.svg",
  "Singapore Airlines": "/airlinesandhotels/singaporeairlines.svg",
  Lufthansa: "/airlinesandhotels/lufthansa.svg",
  "British Airways": "/airlinesandhotels/britishairways.svg",
  IndiGo: "/airlinesandhotels/indigo.svg",
  "Air India": "/airlinesandhotels/airindia.svg",
};

export function logoForAirline(name) {
  return AIRLINE_LOGOS[name] || "";
}
