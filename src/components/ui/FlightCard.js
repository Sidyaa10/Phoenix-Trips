import React from "react";
import { Button, Divider, Paper, Typography } from "@mui/material";
import { AccessTime, FlightTakeoff, SellOutlined } from "@mui/icons-material";
import StatusBadge from "./StatusBadge";

export default function FlightCard({
  flight,
  aircraft,
  airlineLogo,
  onBook,
  compact = false,
}) {
  return (
    <Paper
      elevation={0}
      className="group relative flex h-full flex-col overflow-hidden rounded-[30px] border border-[rgba(139,64,100,0.12)] bg-[rgba(254,254,234,0.96)] shadow-[0_22px_60px_rgba(139,64,100,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(139,64,100,0.14)]"
    >
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(213,136,103,0.34),_rgba(254,254,234,0.94)_55%,_rgba(255,255,255,1)_100%)] px-5 pb-4 pt-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <StatusBadge label={flight.status} />
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#7a6055] shadow-sm">
            {flight.flightNumber}
          </span>
        </div>

        <div className="mb-4 flex min-h-[138px] items-center justify-center rounded-[24px] border border-white/80 bg-white/70 px-3">
          {aircraft ? (
            <img
              className="max-h-[118px] w-full object-contain drop-shadow-[0_18px_18px_rgba(15,23,42,0.12)] transition duration-300 group-hover:scale-[1.03]"
              src={aircraft.image}
              alt={aircraft.model}
            />
          ) : (
            <div className="flex h-[118px] w-full items-center justify-center rounded-[20px] bg-[rgba(195,129,136,0.12)] text-[#8b4064]">
              <FlightTakeoff />
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#4f2c2d", lineHeight: 1.1 }}>
              {flight.fromCity} ({flight.airportCodes?.from})
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#7a6055" }}>
              {flight.departureTime}
            </Typography>
          </div>
          <div className="flex-1 pt-3">
            <div className="relative h-px bg-[rgba(139,64,100,0.16)]">
              <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#bb581e]" />
            </div>
            <Typography variant="caption" sx={{ mt: 1, display: "block", textAlign: "center", color: "#7a6055" }}>
              {flight.duration}
            </Typography>
          </div>
          <div className="min-w-0 text-right">
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#4f2c2d", lineHeight: 1.1 }}>
              {flight.toCity} ({flight.airportCodes?.to})
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#7a6055" }}>
              {flight.arrivalTime}
            </Typography>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Typography variant="body2" sx={{ color: "#7a6055" }}>
              Airline
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#4f2c2d" }}>
              {flight.airline?.name}
            </Typography>
            {aircraft?.model ? (
              <Typography variant="body2" sx={{ mt: 0.25, color: "#6f5a51" }}>
                {aircraft.model}
              </Typography>
            ) : null}
          </div>
          {airlineLogo ? (
            <img
              src={airlineLogo}
              alt={flight.airline?.name || "Airline"}
              className="h-8 max-w-[110px] object-contain"
            />
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/80 px-4 py-3">
            <div className="mb-1 flex items-center gap-2 text-[#8b4064]">
              <AccessTime sx={{ fontSize: 16 }} />
              <span className="text-xs font-medium uppercase tracking-[0.18em]">Schedule</span>
            </div>
            <Typography variant="body2" sx={{ color: "#4f2c2d", fontWeight: 600 }}>
              {flight.departureTime} to {flight.arrivalTime}
            </Typography>
          </div>
          <div className="rounded-2xl bg-white/80 px-4 py-3">
            <div className="mb-1 flex items-center gap-2 text-[#8b4064]">
              <SellOutlined sx={{ fontSize: 16 }} />
              <span className="text-xs font-medium uppercase tracking-[0.18em]">Fare</span>
            </div>
            <Typography variant="body2" sx={{ color: "#4f2c2d", fontWeight: 600 }}>
              Non-stop preferred fare
            </Typography>
          </div>
        </div>

        <Divider sx={{ my: 3 }} />

        <div className={`mt-auto flex ${compact ? "flex-col gap-3" : "items-center justify-between gap-4"}`}>
          <div>
            <Typography variant="body2" sx={{ color: "#7a6055" }}>
              Starting from
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#4f2c2d" }}>
              INR {flight.basePrice}
            </Typography>
          </div>
          <Button
            variant="contained"
            onClick={() => onBook(flight)}
            sx={{
              minWidth: compact ? "100%" : 154,
              borderRadius: "999px",
              background: "linear-gradient(135deg, #8b4064 0%, #bb581e 100%)",
              px: 3,
              py: 1.2,
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "0 18px 36px rgba(139, 64, 100, 0.18)",
              "&:hover": {
                background: "linear-gradient(135deg, #6e314f 0%, #a14b19 100%)",
              },
            }}
          >
            Book now
          </Button>
        </div>
      </div>
    </Paper>
  );
}
