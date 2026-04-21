import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  AccessTime,
  CheckCircleOutline,
  DinnerDining,
  DoNotDisturbOn,
  FlightTakeoff,
  LocationOn,
  Star,
} from "@mui/icons-material";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { featuredTrips, getTripPackage, calculateTripPrice } from "../data/tripPackages";
import SectionHeader from "./ui/SectionHeader";
import BookingSummaryCard from "./ui/BookingSummaryCard";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const defaultLeafletIcon = L.icon({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38 } },
};

function fmt(currency, value) {
  return `${currency} ${new Intl.NumberFormat("en-US").format(value)}`;
}

function mealBadge(meal) {
  if (meal === "Breakfast") return "Breakfast";
  if (meal === "Lunch") return "Lunch";
  return "Dinner";
}

export default function TripPackageDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthDialog } = useAuth();
  const pkg = getTripPackage(slug);
  const [travelers, setTravelers] = useState(2);
  const [mapReady, setMapReady] = useState(false);
  const [foodPreference, setFoodPreference] = useState("all");
  const [departureDate, setDepartureDate] = useState("");
  const [bookingError, setBookingError] = useState("");

  const tripCard = useMemo(() => featuredTrips.find((d) => d.slug === slug), [slug]);
  const pricing = useMemo(() => (pkg ? calculateTripPrice(pkg, travelers) : null), [pkg, travelers]);
  const routePath = useMemo(() => (pkg ? pkg.routeStops.map((s) => [s.lat, s.lng]) : []), [pkg]);
  const bookingSummaryItems = useMemo(() => {
    if (!pkg || !pricing) return [];
    return [
      { label: "Travelers", value: `${travelers}` },
      { label: "Discount", value: `${pricing.label} (${pricing.discountPercent}%)` },
      { label: "Price / person", value: fmt(pkg.currency, pricing.perPerson) },
      { label: "Total cost", value: fmt(pkg.currency, pricing.total) },
      {
        label: "Dining",
        value:
          foodPreference === "all"
            ? "Mixed package menu"
            : foodPreference === "veg"
              ? "Vegetarian preference"
              : "Non-vegetarian preference",
      },
    ];
  }, [foodPreference, pkg, pricing, travelers]);
  const bookingHighlights = useMemo(() => {
    if (!pricing) return [];
    return [
      `Savings applied: ${pkg ? fmt(pkg.currency, Math.max(0, pricing.savings)) : ""}`,
      "Couple: 2 travelers (10%)",
      "Family: 3-5 travelers (15%)",
      "Group: >7 travelers (20%)",
    ];
  }, [pkg, pricing]);
  const visibleRestaurants = useMemo(() => {
    if (!pkg) return [];
    if (foodPreference === "all") return pkg.restaurants;
    return pkg.restaurants.filter((restaurant) => restaurant.preferences?.includes(foodPreference));
  }, [pkg, foodPreference]);

  useEffect(() => {
    setMapReady(true);
  }, []);

  async function submitPackageBooking() {
    if (!isAuthenticated) {
      openAuthDialog();
      return;
    }
    if (!departureDate || !pkg || !pricing) {
      setBookingError("Select a departure date to book this package.");
      return;
    }
    try {
      setBookingError("");
      await api.post("/bookings/package", {
        packageSlug: pkg.slug,
        packageTitle: pkg.title,
        packageLocation: `${pkg.city}, ${pkg.country}`,
        date: departureDate,
        travelers,
        mealPreference: foodPreference,
        pricePerPerson: pricing.perPerson,
        totalCost: pricing.total,
      });
      navigate("/my-bookings");
    } catch (err) {
      setBookingError(err.message);
    }
  }

  if (!pkg) {
    return (
      <Container className="py-10">
        <Card className="mx-auto max-w-2xl rounded-2xl shadow-md">
          <CardContent className="p-8 text-left">
            <Typography variant="h4" className="font-bold">
              {tripCard ? `${tripCard.city}, ${tripCard.country}` : "Trip Package"}
            </Typography>
            <Typography className="mt-3 text-slate-600">
              This package is not available yet. Please choose one of the published Phoenix Trips itineraries.
            </Typography>
            <Button className="mt-5" variant="contained" onClick={() => navigate("/trip-packages/dubai-uae")}>
              Open Dubai Package
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <div className="bg-[linear-gradient(180deg,#fffdf9_0%,#fefeea_42%,#fff8f3_100%)] pb-12">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative h-[420px] w-full overflow-hidden"
      >
        <img src={pkg.heroImage} alt={pkg.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <Container maxWidth="lg" className="absolute inset-0">
          <div className="flex h-full items-end pb-10">
            <div className="max-w-3xl text-left text-white">
              <Chip label="Phoenix Trips Signature" className="mb-4 bg-white/90 font-semibold text-[#4f2c2d]" />
              <Typography variant="h3" className="font-extrabold">
                {pkg.title}
              </Typography>
              <Typography className="mt-2 text-lg">
                {pkg.city}, {pkg.country}
              </Typography>
              <Typography className="mt-1 text-sm md:text-base">
                {pkg.durationDays} Days / {pkg.durationNights} Nights
              </Typography>
              <Typography variant="h5" className="mt-4 font-bold text-[#f6d2c5]">
                From {fmt(pkg.currency, pkg.basePricePerPerson)} per person
              </Typography>
              <motion.div whileHover={{ scale: 1.03 }} className="mt-4 inline-block">
                <Button
                  variant="contained"
                  className="rounded-full bg-[#8b4064] px-8 py-3 font-semibold text-white hover:bg-[#6e314f]"
                  onClick={submitPackageBooking}
                >
                  Book This Trip
                </Button>
              </motion.div>
            </div>
          </div>
        </Container>
      </motion.section>

      <Container maxWidth="lg" className="mt-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-10">
          <div className="space-y-6 xl:col-span-7">
            <motion.div variants={reveal} initial="hidden" animate="show">
              <Card className="rounded-[28px] border border-[rgba(139,64,100,0.12)] bg-[rgba(254,254,234,0.94)] shadow-[0_24px_60px_rgba(139,64,100,0.10)]">
                <CardContent className="p-6 text-left">
                  <Typography variant="h5" className="font-bold text-[#4f2c2d]">
                    Trip Overview
                  </Typography>
                  <Typography className="mt-3 text-[#6f5a51]">{pkg.overview}</Typography>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Paper className="flex items-center gap-2 rounded-2xl bg-white/80 p-3 shadow-none">
                      <FlightTakeoff className="text-[#8b4064]" />
                      <Typography>Departure: {pkg.departureCity}</Typography>
                    </Paper>
                    <Paper className="flex items-center gap-2 rounded-2xl bg-white/80 p-3 shadow-none">
                      <AccessTime className="text-[#8b4064]" />
                      <Typography>{pkg.startDateLabel}</Typography>
                    </Paper>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={reveal} initial="hidden" animate="show">
              <SectionHeader
                eyebrow="Highlights"
                title="What makes this package special"
                description="These are the marquee moments included in the experience, chosen to keep the trip feeling memorable rather than rushed."
                className="mb-3"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {pkg.highlights.map((item) => (
                  <Card key={item} className="rounded-[24px] border border-[rgba(139,64,100,0.10)] bg-white/85 shadow-sm">
                    <CardContent className="p-4 text-left">
                      <Star className="mb-2 text-[#bb581e]" />
                      <Typography className="text-sm text-[#6f5a51]">{item}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            <motion.div variants={reveal} initial="hidden" animate="show">
              <SectionHeader
                eyebrow="Destinations"
                title="Places you will visit"
                description="Every stop is chosen to balance iconic sights with more relaxed local moments across the journey."
                className="mb-3"
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pkg.destinationGallery.map((stop) => (
                  <Card key={stop.name} className="overflow-hidden rounded-[28px] border border-[rgba(139,64,100,0.10)] bg-white/90 shadow-md transition-shadow hover:shadow-lg">
                    <img src={stop.image} alt={stop.name} className="h-48 w-full object-cover" />
                    <CardContent className="space-y-2 p-4 text-left">
                      <div className="flex items-center justify-between gap-3">
                        <Typography variant="h6" className="font-bold text-[#4f2c2d]">
                          {stop.name}
                        </Typography>
                        <Chip size="small" label={`Day ${stop.visitDay}`} sx={{ backgroundColor: "rgba(139,64,100,0.10)", color: "#8b4064", fontWeight: 600 }} />
                      </div>
                      <Typography className="text-sm font-medium text-[#8b4064]">{stop.area}</Typography>
                      <Typography className="text-sm text-[#6f5a51]">{stop.description}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            <motion.div variants={reveal} initial="hidden" animate="show">
              <SectionHeader
                eyebrow="Itinerary"
                title="Day-by-day itinerary"
                description="A polished daily flow that keeps sightseeing, downtime, and dining in balance."
                className="mb-3"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pkg.itinerary.map((day) => (
                  <motion.div key={day.day} whileHover={{ y: -4 }}>
                    <Card className="h-full overflow-hidden rounded-[28px] border border-[rgba(139,64,100,0.10)] bg-white/90 shadow-md transition-shadow hover:shadow-lg">
                      <img src={day.image} alt={day.title} className="h-44 w-full object-cover" />
                      <CardContent className="space-y-2 p-4 text-left">
                        <Chip size="small" label={`Day ${day.day}`} sx={{ backgroundColor: "rgba(195,129,136,0.14)", color: "#8b4064", fontWeight: 600 }} />
                        <Typography variant="h6" className="font-bold text-[#4f2c2d]">
                          {day.title}
                        </Typography>
                        <Typography className="text-sm text-[#6f5a51]">
                          <strong>Morning:</strong> {day.morning}
                        </Typography>
                        <Typography className="text-sm text-[#6f5a51]">
                          <strong>Afternoon:</strong> {day.afternoon}
                        </Typography>
                        <Typography className="text-sm text-[#6f5a51]">
                          <strong>Evening:</strong> {day.evening}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={reveal} initial="hidden" animate="show">
              <SectionHeader
                eyebrow="Route"
                title="Map route"
                description="Follow the flow of the package from arrival through the signature stops included in the trip."
                className="mb-3"
              />
              <Card className="overflow-hidden rounded-[28px] border border-[rgba(139,64,100,0.10)] bg-white/90 shadow-md">
                <CardContent className="p-0">
                  {mapReady && routePath.length > 0 ? (
                    <MapContainer center={routePath[0]} zoom={10} className="h-[380px] w-full">
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                      />
                      <Polyline positions={routePath} pathOptions={{ color: "#8b4064", weight: 4 }} />
                      {pkg.routeStops.map((stop) => (
                        <Marker key={stop.name} position={[stop.lat, stop.lng]} icon={defaultLeafletIcon}>
                          <Popup>{stop.name}</Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  ) : (
                    <div className="flex h-[380px] items-center justify-center bg-slate-100 px-4 text-center text-sm text-slate-600">
                      Route map is loading...
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={reveal} initial="hidden" animate="show">
              <SectionHeader
                eyebrow="Stay"
                title="Hotels included"
                description="Your stays are selected to match the pace of the itinerary, so the hotel experience supports the destination rather than interrupting it."
                className="mb-3"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {pkg.hotelsIncluded.map((hotel) => (
                  <Card key={hotel.name} className="overflow-hidden rounded-[28px] border border-[rgba(139,64,100,0.10)] bg-white/90 shadow-sm transition-shadow hover:shadow-md">
                    <img src={hotel.image} alt={hotel.name} className="h-44 w-full object-cover" />
                    <CardContent className="p-4 text-left">
                      <Typography className="font-semibold text-[#4f2c2d]">{hotel.name}</Typography>
                      <Typography className="mt-1 text-sm text-[#8b4064]">{hotel.stay}</Typography>
                      <Typography className="mt-1 inline-flex items-center gap-1 text-sm text-[#6f5a51]">
                        <LocationOn fontSize="small" /> {hotel.location}
                      </Typography>
                      <Typography className="mt-2 text-sm text-[#6f5a51]">{hotel.description}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            <motion.div variants={reveal} initial="hidden" animate="show">
              <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <SectionHeader
                  eyebrow="Dining"
                  title="Restaurants included"
                  description="Switch the dining view based on guest preference without changing the trip structure."
                />
                <FormControl size="small" className="min-w-[210px]">
                  <InputLabel id="food-preference-label">Dining Preference</InputLabel>
                  <Select
                    labelId="food-preference-label"
                    value={foodPreference}
                    label="Dining Preference"
                    onChange={(event) => setFoodPreference(event.target.value)}
                  >
                    <MenuItem value="all">All Options</MenuItem>
                    <MenuItem value="veg">Vegetarian</MenuItem>
                    <MenuItem value="non-veg">Non-Vegetarian</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {visibleRestaurants.map((restaurant) => (
                  <Card key={restaurant.name} className="overflow-hidden rounded-[28px] border border-[rgba(139,64,100,0.10)] bg-white/90 shadow-sm transition-shadow hover:shadow-md">
                    <img src={restaurant.image} alt={restaurant.name} className="h-40 w-full object-cover" />
                    <CardContent className="flex items-center justify-between gap-3 p-4 text-left">
                      <div className="min-w-0">
                        <Typography className="font-semibold text-[#4f2c2d]">{restaurant.name}</Typography>
                        <Typography className="text-sm text-[#8b4064]">{mealBadge(restaurant.meal)}</Typography>
                        <Typography className="mt-1 text-sm text-[#6f5a51]">{restaurant.recommendedDish}</Typography>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {restaurant.preferences?.map((preference) => (
                            <Chip
                              key={`${restaurant.name}-${preference}`}
                              size="small"
                              label={preference === "veg" ? "Veg Friendly" : "Non-Veg"}
                              sx={{ backgroundColor: preference === "veg" ? "rgba(254,254,234,0.95)" : "rgba(255,244,234,0.95)", color: preference === "veg" ? "#8b4064" : "#bb581e", fontWeight: 600 }}
                            />
                          ))}
                        </div>
                      </div>
                      <DinnerDining className="text-[#8b4064]" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              {!visibleRestaurants.length ? (
                <Paper className="mt-3 rounded-[24px] bg-white/80 p-4 text-left shadow-none">
                  <Typography className="text-sm text-[#6f5a51]">
                    No restaurant is tagged for this dining preference yet. Switch to <strong>All Options</strong> to view the full package dining list.
                  </Typography>
                </Paper>
              ) : null}
            </motion.div>

            <motion.div variants={reveal} initial="hidden" animate="show">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="rounded-[28px] border border-[rgba(139,64,100,0.10)] bg-white/90 shadow-md">
                    <CardContent className="p-4 text-left">
                      <Typography variant="h6" className="font-bold text-[#4f2c2d]">
                        Inclusions
                      </Typography>
                    <ul className="mt-3 space-y-2">
                      {pkg.inclusions.map((inc) => (
                        <li key={inc} className="flex items-start gap-2 text-sm text-[#6f5a51]">
                          <CheckCircleOutline fontSize="small" className="mt-0.5 text-[#8b4064]" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                  <Card className="rounded-[28px] border border-[rgba(139,64,100,0.10)] bg-white/90 shadow-md">
                    <CardContent className="p-4 text-left">
                      <Typography variant="h6" className="font-bold text-[#4f2c2d]">
                        Exclusions
                      </Typography>
                    <ul className="mt-3 space-y-2">
                      {pkg.exclusions.map((exc) => (
                        <li key={exc} className="flex items-start gap-2 text-sm text-[#6f5a51]">
                          <DoNotDisturbOn fontSize="small" className="mt-0.5 text-[#bb581e]" />
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>

          <div className="xl:col-span-3">
            <motion.div
              variants={reveal}
              initial="hidden"
              animate="show"
              className="sticky top-24"
            >
              <BookingSummaryCard
                sticky
                title="Book This Package"
                summaryItems={bookingSummaryItems}
                highlights={bookingHighlights}
                ctaLabel="Continue Booking"
                onCta={submitPackageBooking}
                ctaDisabled={!departureDate}
              >
                <div className="space-y-4">
                  {bookingError ? (
                    <Typography className="text-sm text-red-600">{bookingError}</Typography>
                  ) : null}
                  <TextField
                    fullWidth
                    size="small"
                    label="Departure Date"
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().slice(0, 10) }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Number of Travelers"
                    type="number"
                    value={travelers}
                    onChange={(e) => setTravelers(Math.max(1, Number(e.target.value || 1)))}
                    inputProps={{ min: 1 }}
                  />
                  <FormControl fullWidth size="small">
                    <InputLabel id="sidebar-food-preference-label">Meal Preference</InputLabel>
                    <Select
                      labelId="sidebar-food-preference-label"
                      value={foodPreference}
                      label="Meal Preference"
                      onChange={(event) => setFoodPreference(event.target.value)}
                    >
                      <MenuItem value="all">All Options</MenuItem>
                      <MenuItem value="veg">Vegetarian</MenuItem>
                      <MenuItem value="non-veg">Non-Vegetarian</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </BookingSummaryCard>
            </motion.div>
          </div>
        </div>
      </Container>
    </div>
  );
}
