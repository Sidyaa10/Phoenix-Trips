import React, { useEffect, useMemo, useState } from "react";
import "./Flights.css";
import { Button, Chip, Container, Grid, Skeleton, Stack, Typography } from "@mui/material";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import SeatSelectionDialog from "./SeatSelectionDialog";
import { useLocation, useNavigate } from "react-router-dom";
import { logoForAirline } from "../constants/airlineLogos";
import { aircraftForFlight } from "../constants/flightAircraft";
import SectionHeader from "./ui/SectionHeader";
import FilterBar from "./ui/FilterBar";
import FlightCard from "./ui/FlightCard";
import BookingSummaryCard from "./ui/BookingSummaryCard";

const fallbackFlights = [
  { id: "fb1", flightNumber: "SG101", fromCity: "Mumbai", toCity: "Singapore", airportCodes: { from: "BOM", to: "SIN" }, basePrice: 35999, duration: "5h 25m", departureTime: "08:15", arrivalTime: "13:40", status: "Active", airline: { name: "Singapore Airlines" } },
  { id: "fb2", flightNumber: "HW202", fromCity: "Mumbai", toCity: "Hawaii", airportCodes: { from: "BOM", to: "HNL" }, basePrice: 125899, duration: "16h 30m", departureTime: "06:00", arrivalTime: "22:30", status: "Active", airline: { name: "Emirates" } },
  { id: "fb3", flightNumber: "WL303", fromCity: "Mumbai", toCity: "Wellington", airportCodes: { from: "BOM", to: "WLG" }, basePrice: 115499, duration: "14h 10m", departureTime: "07:25", arrivalTime: "21:35", status: "Active", airline: { name: "Qatar Airways" } },
  { id: "fb4", flightNumber: "MB404", fromCity: "Mumbai", toCity: "Melbourne", airportCodes: { from: "BOM", to: "MEL" }, basePrice: 95899, duration: "12h 45m", departureTime: "09:40", arrivalTime: "22:25", status: "Active", airline: { name: "Etihad Airways" } },
  { id: "fb5", flightNumber: "JD505", fromCity: "Mumbai", toCity: "Jeddah", airportCodes: { from: "BOM", to: "JED" }, basePrice: 45699, duration: "5h 10m", departureTime: "10:10", arrivalTime: "15:20", status: "Active", airline: { name: "Emirates" } },
  { id: "fb6", flightNumber: "PR606", fromCity: "Mumbai", toCity: "Paris", airportCodes: { from: "BOM", to: "CDG" }, basePrice: 72899, duration: "9h 30m", departureTime: "11:00", arrivalTime: "20:30", status: "Active", airline: { name: "Lufthansa" } },
  { id: "fb7", flightNumber: "DB707", fromCity: "Mumbai", toCity: "Dubai", airportCodes: { from: "BOM", to: "DXB" }, basePrice: 45999, duration: "3h 25m", departureTime: "13:15", arrivalTime: "16:40", status: "Active", airline: { name: "Emirates" } },
  { id: "fb8", flightNumber: "BL808", fromCity: "Mumbai", toCity: "Bali", airportCodes: { from: "BOM", to: "DPS" }, basePrice: 42999, duration: "8h 15m", departureTime: "14:00", arrivalTime: "22:15", status: "Active", airline: { name: "Singapore Airlines" } },
  { id: "fb9", flightNumber: "JJ909", fromCity: "Mumbai", toCity: "Jeju-do", airportCodes: { from: "BOM", to: "CJU" }, basePrice: 65299, duration: "10h 40m", departureTime: "07:00", arrivalTime: "17:40", status: "Active", airline: { name: "Qatar Airways" } },
  { id: "fb10", flightNumber: "JP010", fromCity: "Mumbai", toCity: "Jaipur", airportCodes: { from: "BOM", to: "JAI" }, basePrice: 22499, duration: "1h 55m", departureTime: "16:20", arrivalTime: "18:15", status: "Active", airline: { name: "British Airways" } },
  { id: "fb11", flightNumber: "MI111", fromCity: "Mumbai", toCity: "Milan", airportCodes: { from: "BOM", to: "MXP" }, basePrice: 68299, duration: "9h 15m", departureTime: "09:10", arrivalTime: "18:25", status: "Active", airline: { name: "Lufthansa" } },
  { id: "fb12", flightNumber: "MD212", fromCity: "Mumbai", toCity: "Madrid", airportCodes: { from: "BOM", to: "MAD" }, basePrice: 65999, duration: "9h 05m", departureTime: "06:35", arrivalTime: "15:40", status: "Active", airline: { name: "British Airways" } },
  { id: "fb13", flightNumber: "MA313", fromCity: "Mumbai", toCity: "Madeira", airportCodes: { from: "BOM", to: "FNC" }, basePrice: 58999, duration: "10h 50m", departureTime: "12:30", arrivalTime: "23:20", status: "Active", airline: { name: "Qatar Airways" } },
  { id: "fb14", flightNumber: "MN414", fromCity: "Mumbai", toCity: "Monaco", airportCodes: { from: "BOM", to: "MCM" }, basePrice: 89999, duration: "10h 05m", departureTime: "05:45", arrivalTime: "15:50", status: "Active", airline: { name: "Etihad Airways" } },
  { id: "fb15", flightNumber: "OK515", fromCity: "Mumbai", toCity: "Okinawa", airportCodes: { from: "BOM", to: "OKA" }, basePrice: 75499, duration: "11h 10m", departureTime: "10:00", arrivalTime: "21:10", status: "Active", airline: { name: "Singapore Airlines" } },
  { id: "fb16", flightNumber: "NP616", fromCity: "Mumbai", toCity: "Napoli", airportCodes: { from: "BOM", to: "NAP" }, basePrice: 37856, duration: "8h 55m", departureTime: "08:40", arrivalTime: "17:35", status: "Active", airline: { name: "Lufthansa" } },
  { id: "fb17", flightNumber: "6E701", fromCity: "Mumbai", toCity: "Dubai", airportCodes: { from: "BOM", to: "DXB" }, basePrice: 38999, duration: "3h 20m", departureTime: "05:55", arrivalTime: "09:15", status: "Active", airline: { name: "IndiGo" } },
  { id: "fb18", flightNumber: "6E702", fromCity: "Mumbai", toCity: "Jaipur", airportCodes: { from: "BOM", to: "JAI" }, basePrice: 10999, duration: "1h 50m", departureTime: "18:10", arrivalTime: "20:00", status: "Active", airline: { name: "IndiGo" } },
];

const parseDurationMinutes = (duration = "") => {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)m/);
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
  return hours * 60 + minutes;
};

const toMinutes = (time = "") => {
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return Number.MAX_SAFE_INTEGER;
  return hours * 60 + minutes;
};

const Flights = () => {
  const { isAuthenticated, openAuthDialog } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [airlineFilter, setAirlineFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromCity = params.get("fromCity") || "";
    const toCity = params.get("toCity") || "";
    const query = new URLSearchParams();
    if (fromCity) query.set("fromCity", fromCity);
    if (toCity) query.set("toCity", toCity);
    api
      .get(`/flights${query.toString() ? `?${query.toString()}` : ""}`)
      .then((res) => {
        setFlights(res.flights || []);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [location.search]);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedAirline = searchParams.get("airline") || "";
  const departureDate = searchParams.get("departureDate") || "";
  const travelers = Number(searchParams.get("travelers") || "1");
  const tripType = searchParams.get("tripType") || "round";
  const fromCity = searchParams.get("fromCity") || "Mumbai";
  const toCity = searchParams.get("toCity") || "Anywhere";

  useEffect(() => {
    setAirlineFilter(selectedAirline);
  }, [selectedAirline]);

  const sourceFlights = useMemo(() => (flights.length ? flights : fallbackFlights), [flights]);

  const airlineOptions = useMemo(
    () => Array.from(new Set(sourceFlights.map((flight) => flight.airline?.name).filter(Boolean))).sort(),
    [sourceFlights]
  );

  const filteredFlights = useMemo(() => {
    let result = sourceFlights.filter((flight) => {
      if (airlineFilter && flight.airline?.name !== airlineFilter) return false;
      if (statusFilter && flight.status !== statusFilter) return false;
      return true;
    });

    switch (sortBy) {
      case "priceAsc":
        result = [...result].sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "priceDesc":
        result = [...result].sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "durationAsc":
        result = [...result].sort(
          (a, b) => parseDurationMinutes(a.duration) - parseDurationMinutes(b.duration)
        );
        break;
      case "departureAsc":
        result = [...result].sort((a, b) => toMinutes(a.departureTime) - toMinutes(b.departureTime));
        break;
      default:
        result = [...result].sort((a, b) => a.basePrice - b.basePrice);
        break;
    }

    return result;
  }, [sourceFlights, airlineFilter, statusFilter, sortBy]);

  const summerSpecial = useMemo(() => filteredFlights.slice(0, 6), [filteredFlights]);

  const handleBook = (flight) => {
    if (!isAuthenticated) {
      openAuthDialog();
      return;
    }
    setSelectedFlight(flight);
  };

  const summaryItems = [
    { label: "Trip type", value: tripType === "oneway" ? "One-way" : tripType === "multi" ? "Multi-city" : "Round trip" },
    { label: "Route", value: `${fromCity} to ${toCity}` },
    { label: "Departure", value: departureDate || "Flexible dates" },
    { label: "Travelers", value: `${travelers}` },
    { label: "Airline", value: airlineFilter || "All active airlines" },
  ];

  return (
    <div className="flights-shell">
      <Container maxWidth="xl" className="py-8 md:py-10">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <SectionHeader
              eyebrow="Flight Marketplace"
              title="Choose the flight that fits the way you travel."
              description="We kept your routes, pricing, and booking flow intact, and upgraded the listing page so users can compare flights with stronger hierarchy, faster filters, and cleaner visuals."
              action={
                <Button
                  variant="outlined"
                  onClick={() => navigate("/")}
                  sx={{
                    borderRadius: "999px",
                    textTransform: "none",
                    px: 2.5,
                    py: 1,
                    fontWeight: 700,
                  }}
                >
                  Back to search
                </Button>
              }
            />

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip size="small" label="Premium layout" />
              <Chip size="small" label="Sticky filters" />
              <Chip size="small" label="Live booking flow" />
              <Chip size="small" label={`${filteredFlights.length} options`} />
            </Stack>

            <FilterBar
              airline={airlineFilter}
              onAirlineChange={setAirlineFilter}
              airlines={airlineOptions}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              tripType={tripType === "oneway" ? "One-way" : tripType === "multi" ? "Multi-city" : "Round trip"}
              travelers={travelers}
            />

            <section className="space-y-4">
              <SectionHeader
                eyebrow="Featured Fares"
                title="Recommended departures"
                description="A quick shortlist of routes with strong availability, clean timing, and the premium carrier mix already inside Phoenix Trips."
              />

              {loading ? (
                <Grid container spacing={3}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Grid item xs={12} md={6} xl={4} key={`featured-skeleton-${index}`}>
                      <Skeleton variant="rounded" height={520} sx={{ borderRadius: "30px" }} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={3}>
                  {summerSpecial.map((flight) => (
                    <Grid item xs={12} md={6} xl={4} key={`featured-${flight.id}`}>
                      <FlightCard
                        flight={flight}
                        aircraft={aircraftForFlight(flight)}
                        airlineLogo={logoForAirline(flight.airline?.name)}
                        onBook={handleBook}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </section>

            <section className="space-y-4">
              <SectionHeader
                eyebrow="All Results"
                title="Browse every available route"
                description="All matching flights in one place, now with clearer pricing, route details, airline branding, and a booking button that keeps the existing seat flow untouched."
              />

              {loading ? (
                <Grid container spacing={3}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Grid item xs={12} md={6} xl={4} key={`all-skeleton-${index}`}>
                      <Skeleton variant="rounded" height={520} sx={{ borderRadius: "30px" }} />
                    </Grid>
                  ))}
                </Grid>
              ) : error ? (
                <div className="flight-empty-state">
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
                    The flights feed needs attention.
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, color: "#475569" }}>
                    {error}
                  </Typography>
                </div>
              ) : filteredFlights.length === 0 ? (
                <div className="flight-empty-state">
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
                    No flights matched those filters.
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, color: "#475569" }}>
                    Try another airline, clear the status filter, or go back to the search panel and broaden the route.
                  </Typography>
                </div>
              ) : (
                <Grid container spacing={3}>
                  {filteredFlights.map((flight) => (
                    <Grid item xs={12} md={6} xl={4} key={flight.id}>
                      <FlightCard
                        flight={flight}
                        aircraft={aircraftForFlight(flight)}
                        airlineLogo={logoForAirline(flight.airline?.name)}
                        onBook={handleBook}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </section>
          </div>

          <div className="xl:pt-16">
            <BookingSummaryCard
              sticky
              title="Booking snapshot"
              summaryItems={summaryItems}
              highlights={[
                "Filters stay visible while you scroll through results.",
                "Your selected date flows directly into the seat picker.",
                "Traveler count stays attached to the search summary.",
              ]}
            />
          </div>
        </div>
      </Container>

      <SeatSelectionDialog
        open={Boolean(selectedFlight)}
        onClose={() => setSelectedFlight(null)}
        flight={selectedFlight}
        initialDate={departureDate}
        travelers={travelers}
      />
    </div>
  );
};

export default Flights;
