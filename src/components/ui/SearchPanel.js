import React from "react";
import {
  Autocomplete,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Airlines,
  ArrowForward,
  CalendarMonth,
  FlightLand,
  FlightTakeoff,
  Groups,
  SwapHoriz,
} from "@mui/icons-material";

export default function SearchPanel({
  tripType,
  setTripType,
  fromCity,
  setFromCity,
  toCity,
  setToCity,
  cities,
  airlines,
  selectedAirline,
  setSelectedAirline,
  departureDate,
  setDepartureDate,
  travelers,
  setTravelers,
  onSwap,
  onSearch,
  minDepartureDate,
}) {
  const tripOptions = [
    { key: "round", label: "Round trip" },
    { key: "oneway", label: "One-way" },
    { key: "multi", label: "Multi-city" },
  ];

  return (
    <Paper
      elevation={0}
      className="overflow-hidden rounded-[36px] border border-[rgba(139,64,100,0.12)] bg-[rgba(254,254,234,0.92)] p-4 shadow-[0_28px_80px_rgba(139,64,100,0.12)] backdrop-blur md:p-6"
    >
      <div className="mb-5 flex flex-col gap-4 md:mb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b4064]">
            Flight Search
          </span>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 800, color: "#4f2c2d", fontSize: { xs: "1.9rem", md: "2.4rem" } }}>
            Plan a smoother takeoff
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, color: "#6f5a51", maxWidth: 680 }}>
            Search routes, compare airlines, pick your departure date, and move straight into booking with a cleaner flow.
          </Typography>
        </div>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {tripOptions.map((option) => (
            <Button
              key={option.key}
              variant={tripType === option.key ? "contained" : "outlined"}
              onClick={() => setTripType(option.key)}
              sx={{
                borderRadius: "999px",
                px: 2.5,
                py: 1.1,
                textTransform: "none",
                fontWeight: 700,
                borderColor: "rgba(139, 64, 100, 0.14)",
                color: tripType === option.key ? "#ffffff" : "#4f2c2d",
                background:
                  tripType === option.key
                    ? "linear-gradient(135deg, #8b4064 0%, #bb581e 100%)"
                    : "#fffdf9",
                "&:hover": {
                  borderColor: "rgba(139, 64, 100, 0.22)",
                  background:
                    tripType === option.key
                      ? "linear-gradient(135deg, #6e314f 0%, #a14b19 100%)"
                      : "#fff8f2",
                },
              }}
            >
              {option.label}
            </Button>
          ))}
        </Stack>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_auto_1.15fr_1fr]">
        <div className="rounded-[28px] border border-[rgba(139,64,100,0.14)] bg-white/80 px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-[#8b4064]">
            <FlightTakeoff sx={{ fontSize: 18 }} />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">From</span>
          </div>
          <Autocomplete
            options={cities}
            value={cities.find((c) => c.city === fromCity) || null}
            getOptionLabel={(option) => `${option.city} (${option.airportCode})`}
            onChange={(_, value) => setFromCity(value?.city || "")}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" placeholder="Choose departure city" fullWidth />
            )}
          />
        </div>

        <div className="flex items-center justify-center">
          <IconButton
            onClick={onSwap}
            sx={{
              mt: { xs: 0, lg: 4 },
              border: "1px solid rgba(139, 64, 100, 0.12)",
              backgroundColor: "#fffdf9",
              boxShadow: "0 14px 32px rgba(139, 64, 100, 0.10)",
              "&:hover": {
                backgroundColor: "#fff6ef",
                transform: "rotate(180deg)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <SwapHoriz />
          </IconButton>
        </div>

        <div className="rounded-[28px] border border-[rgba(139,64,100,0.14)] bg-white/80 px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-[#8b4064]">
            <FlightLand sx={{ fontSize: 18 }} />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">To</span>
          </div>
          <Autocomplete
            options={cities}
            value={cities.find((c) => c.city === toCity) || null}
            getOptionLabel={(option) => `${option.city} (${option.airportCode})`}
            onChange={(_, value) => setToCity(value?.city || "")}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" placeholder="Choose destination" fullWidth />
            )}
          />
        </div>

        <div className="rounded-[28px] border border-[rgba(139,64,100,0.14)] bg-[linear-gradient(135deg,rgba(254,254,234,0.95),rgba(255,246,239,0.98))] px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-[#8b4064]">
            <ArrowForward sx={{ fontSize: 18 }} />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">Go live</span>
          </div>
          <Typography variant="body2" sx={{ color: "#6f5a51", mb: 2 }}>
            Run the search with your selected filters.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={onSearch}
            endIcon={<ArrowForward />}
            sx={{
              borderRadius: "999px",
              background: "linear-gradient(135deg, #8b4064 0%, #bb581e 100%)",
              py: 1.45,
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "0 20px 42px rgba(139, 64, 100, 0.18)",
              "&:hover": {
                background: "linear-gradient(135deg, #6e314f 0%, #a14b19 100%)",
              },
            }}
          >
            Search flights
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[26px] border border-[rgba(139,64,100,0.14)] bg-white/80 px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-[#8b4064]">
            <Airlines sx={{ fontSize: 18 }} />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">Preferred Airline</span>
          </div>
          <TextField
            select
            value={selectedAirline}
            onChange={(e) => setSelectedAirline(e.target.value)}
            fullWidth
          >
            <MenuItem value="">All airlines</MenuItem>
            {airlines.map((airline) => (
              <MenuItem key={airline.id || airline._id || airline.name} value={airline.name}>
                {airline.name}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <div className="rounded-[26px] border border-[rgba(139,64,100,0.14)] bg-white/80 px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-[#8b4064]">
            <CalendarMonth sx={{ fontSize: 18 }} />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">Departure Date</span>
          </div>
          <TextField
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: minDepartureDate }}
            fullWidth
          />
        </div>

        <div className="rounded-[26px] border border-[rgba(139,64,100,0.14)] bg-white/80 px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-[#8b4064]">
            <Groups sx={{ fontSize: 18 }} />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">Travelers</span>
          </div>
          <TextField
            select
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value))}
            fullWidth
          >
            {Array.from({ length: 9 }, (_, index) => index + 1).map((count) => (
              <MenuItem key={count} value={count}>
                {count} {count === 1 ? "Traveler" : "Travelers"}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </div>
    </Paper>
  );
}
