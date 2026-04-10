const FLIGHT_AIRCRAFT = {
  SG101: {
    model: "Boeing 787-10",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
  },
  HW202: {
    model: "Boeing 777-300ER",
    image:
      "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1200&q=80",
  },
  WL303: {
    model: "Airbus A350-1000",
    image:
      "https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1200&q=80",
  },
  MB404: {
    model: "Boeing 787-9",
    image:
      "https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&w=1200&q=80",
  },
  JD505: {
    model: "Boeing 777-300ER",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
  },
  PR606: {
    model: "Airbus A350-900",
    image:
      "https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=1200&q=80",
  },
  DB707: {
    model: "Boeing 777-300ER",
    image:
      "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1200&q=80",
  },
  BL808: {
    model: "Airbus A350-900",
    image:
      "https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1200&q=80",
  },
  JJ909: {
    model: "Boeing 787-8",
    image:
      "https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&w=1200&q=80",
  },
  JP010: {
    model: "Airbus A320neo",
    image:
      "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&w=1200&q=80",
  },
  MI111: {
    model: "Airbus A350-900",
    image:
      "https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=1200&q=80",
  },
  MD212: {
    model: "Boeing 787-9",
    image:
      "https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&w=1200&q=80",
  },
  MA313: {
    model: "Boeing 787-8",
    image:
      "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1200&q=80",
  },
  MN414: {
    model: "Boeing 787-9",
    image:
      "https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&w=1200&q=80",
  },
  OK515: {
    model: "Boeing 787-10",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
  },
  NP616: {
    model: "Airbus A350-900",
    image:
      "https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=1200&q=80",
  },
  "6E701": {
    model: "Airbus A320neo",
    image:
      "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&w=1200&q=80",
  },
  "6E702": {
    model: "Airbus A320neo",
    image:
      "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&w=1200&q=80",
  },
  EK419: {
    model: "Boeing 777-300ER",
    image:
      "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1200&q=80",
  },
  EY212: {
    model: "Boeing 787-9",
    image:
      "https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&w=1200&q=80",
  },
  QR321: {
    model: "Airbus A350-1000",
    image:
      "https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1200&q=80",
  },
  SQ944: {
    model: "Boeing 737-8 MAX",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
  },
};

const AIRLINE_FALLBACK_AIRCRAFT = {
  Emirates: FLIGHT_AIRCRAFT.EK419,
  "Etihad Airways": FLIGHT_AIRCRAFT.EY212,
  "Qatar Airways": FLIGHT_AIRCRAFT.QR321,
  "Singapore Airlines": FLIGHT_AIRCRAFT.SQ944,
  Lufthansa: FLIGHT_AIRCRAFT.PR606,
  "British Airways": FLIGHT_AIRCRAFT.JP010,
  IndiGo: FLIGHT_AIRCRAFT["6E701"],
  "Air India": {
    model: "Airbus A320neo",
    image:
      "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&w=1200&q=80",
  },
};

export function aircraftForFlight(flight) {
  if (!flight) return null;
  return (
    FLIGHT_AIRCRAFT[flight.flightNumber] ||
    AIRLINE_FALLBACK_AIRCRAFT[flight.airline?.name] ||
    null
  );
}
