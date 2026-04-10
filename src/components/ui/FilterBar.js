import React from "react";
import { MenuItem, Paper, TextField, Typography } from "@mui/material";

export default function FilterBar({
  airline,
  onAirlineChange,
  airlines,
  status,
  onStatusChange,
  sortBy,
  onSortChange,
  tripType,
  travelers,
}) {
  return (
    <Paper
      elevation={0}
      className="sticky top-20 z-20 rounded-[28px] border border-[rgba(139,64,100,0.12)] bg-[rgba(254,254,234,0.92)] px-4 py-4 shadow-[0_20px_50px_rgba(139,64,100,0.10)] backdrop-blur"
    >
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b4064]">
            Smart Filters
          </span>
          <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: "#4f2c2d" }}>
            Refine your flight options
          </Typography>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/82 px-3 py-1 text-xs font-medium text-[#7a6055]">
            {tripType}
          </span>
          <span className="rounded-full bg-white/82 px-3 py-1 text-xs font-medium text-[#7a6055]">
            {travelers} {travelers === 1 ? "traveler" : "travelers"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <TextField
          select
          label="Airline"
          value={airline}
          onChange={(e) => onAirlineChange(e.target.value)}
          fullWidth
        >
          <MenuItem value="">All airlines</MenuItem>
          {airlines.map((airlineOption) => (
            <MenuItem key={airlineOption} value={airlineOption}>
              {airlineOption}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Flight status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          fullWidth
        >
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Delayed">Delayed</MenuItem>
          <MenuItem value="Cancelled">Cancelled</MenuItem>
          <MenuItem value="Fully Booked">Fully Booked</MenuItem>
        </TextField>

        <TextField
          select
          label="Sort by"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          fullWidth
        >
          <MenuItem value="recommended">Recommended</MenuItem>
          <MenuItem value="priceAsc">Price: Low to high</MenuItem>
          <MenuItem value="priceDesc">Price: High to low</MenuItem>
          <MenuItem value="durationAsc">Duration: Shortest first</MenuItem>
          <MenuItem value="departureAsc">Departure: Earliest first</MenuItem>
        </TextField>
      </div>
    </Paper>
  );
}
