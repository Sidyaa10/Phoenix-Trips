import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Button, Chip, Skeleton, Stack } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { api } from "../api";
import { featuredTrips } from "../data/tripPackages";
import SearchPanel from "./ui/SearchPanel";
import SectionHeader from "./ui/SectionHeader";
import BookingSummaryCard from "./ui/BookingSummaryCard";

const Home = () => {
  const [tripType, setTripType] = useState("round");
  const [fromCity, setFromCity] = useState("Mumbai");
  const [toCity, setToCity] = useState("");
  const [cities, setCities] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [selectedAirline, setSelectedAirline] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [metaLoading, setMetaLoading] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    Promise.all([api.get("/meta/cities"), api.get("/meta/airlines")])
      .then(([citiesRes, airlinesRes]) => {
        setCities(citiesRes.cities || []);
        setAirlines(airlinesRes.airlines || []);
      })
      .catch(() => {
        setCities([]);
        setAirlines([]);
      })
      .finally(() => setMetaLoading(false));
  }, []);

  const minDepartureDate = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 550,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 720,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const handleSwapCities = () => {
    setFromCity(toCity);
    setToCity(fromCity);
  };

  const buildQuery = () => {
    const query = new URLSearchParams();
    if (fromCity) query.set("fromCity", fromCity);
    if (toCity) query.set("toCity", toCity);
    if (selectedAirline) query.set("airline", selectedAirline);
    if (departureDate) query.set("departureDate", departureDate);
    if (travelers) query.set("travelers", String(travelers));
    if (tripType) query.set("tripType", tripType);
    return query.toString();
  };

  const handleViewFlights = () => {
    navigate(`/flights?${buildQuery()}`);
  };

  const summaryItems = [
    { label: "Trip type", value: tripType === "oneway" ? "One-way" : tripType === "multi" ? "Multi-city" : "Round trip" },
    { label: "Route", value: `${fromCity || "Choose departure"} ${toCity ? `to ${toCity}` : ""}`.trim() },
    { label: "Airline", value: selectedAirline || "All active airlines" },
    { label: "Travelers", value: `${travelers}` },
  ];

  return (
    <div className="home-shell">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <SectionHeader
              title="With every journey, give your soul a new rebirth."
            />

            {metaLoading ? (
              <div className="grid grid-cols-1 gap-4">
                <Skeleton variant="rounded" height={420} sx={{ borderRadius: "36px" }} />
              </div>
            ) : (
              <SearchPanel
                tripType={tripType}
                setTripType={setTripType}
                fromCity={fromCity}
                setFromCity={setFromCity}
                toCity={toCity}
                setToCity={setToCity}
                cities={cities}
                airlines={airlines}
                selectedAirline={selectedAirline}
                setSelectedAirline={setSelectedAirline}
                departureDate={departureDate}
                setDepartureDate={setDepartureDate}
                travelers={travelers}
                setTravelers={setTravelers}
                onSwap={handleSwapCities}
                onSearch={handleViewFlights}
                minDepartureDate={minDepartureDate}
              />
            )}
          </div>

          <div className="lg:pt-16">
            <BookingSummaryCard
              sticky
              title="Search snapshot"
              summaryItems={summaryItems}
              highlights={[
                "Filter by airline before you open the flights listing.",
                "Carry the departure date directly into booking.",
                "Keep traveler count visible during the booking flow.",
              ]}
              ctaLabel="See matching flights"
              onCta={handleViewFlights}
            />
          </div>
        </div>

        <section className="mt-12">
          <SectionHeader
            eyebrow="Featured Packages"
            title="Curated departures from Mumbai"
            description="Discover handpicked routes and package-led destinations designed to feel like a polished travel marketplace without changing your current content structure."
            action={
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                className="home-primary-btn"
                onClick={handleViewFlights}
              >
                View matching flights
              </Button>
            }
          />

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="mt-4">
            <Chip size="small" label="Curated trips" />
            <Chip size="small" label="Premium cards" />
            <Chip size="small" label="Improved mobile search" />
          </Stack>

          <div className="home-carousel mt-8">
            <Slider {...sliderSettings}>
              {featuredTrips.map((dest) => (
                <div
                  key={dest.id}
                  className="home-deal-slide"
                  onClick={() => navigate(`/trip-packages/${dest.slug}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate(`/trip-packages/${dest.slug}`);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div
                    className="home-deal-card"
                    style={{ backgroundImage: `url(${dest.image})` }}
                  >
                    <div className="home-deal-overlay" />
                    <div className="home-deal-meta">
                      <span className="home-deal-tag">Round trip | Economy</span>
                      <div>
                        <h3>{dest.city}, {dest.country}</h3>
                        <p>From INR {dest.price} | {dest.miles} miles away</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

