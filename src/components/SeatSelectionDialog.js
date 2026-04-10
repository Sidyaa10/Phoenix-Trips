import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { api } from "../api";
import "./SeatSelectionDialog.css";

const cyanGreen = "#3ad7c0";
const cyanRed = "#ff5f6d";

function isPastDateInput(date) {
  if (!date) return true;
  const today = new Date().toISOString().slice(0, 10);
  return date < today;
}

export default function SeatSelectionDialog({
  open,
  onClose,
  flight,
  initialDate = "",
  travelers = 1,
  onBooked,
}) {
  const [date, setDate] = useState("");
  const [seatClass, setSeatClass] = useState("Economy");
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState("");
  const [lockExpiresAt, setLockExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setDate(initialDate || "");
      setSeats([]);
      setSelectedSeat("");
      setLockExpiresAt("");
      setError("");
      setSeatClass("Economy");
    }
  }, [open, initialDate]);

  useEffect(() => {
    if (open && initialDate) {
      setDate(initialDate);
    }
  }, [open, initialDate]);

  useEffect(() => {
    if (!date || !flight?.id || isPastDateInput(date)) return;
    setLoading(true);
    setError("");
    api
      .get(`/flights/${flight.id}/seats?date=${date}`)
      .then((res) => setSeats(res.seats || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [date, flight]);

  const filteredSeats = useMemo(() => seats.filter((s) => s.class === seatClass), [seats, seatClass]);

  const groupedRows = useMemo(() => {
    const map = new Map();
    filteredSeats.forEach((seat) => {
      const match = String(seat.seatNumber).match(/^(\d+)([A-Z])$/);
      if (!match) return;
      const row = Number(match[1]);
      const col = match[2];
      if (!map.has(row)) map.set(row, {});
      map.get(row)[col] = seat;
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([row, cols]) => ({ row, cols }));
  }, [filteredSeats]);

  const handleLockSeat = async (seatNumber) => {
    try {
      setError("");
      const res = await api.post(`/flights/${flight.id}/seats/lock`, {
        date,
        seatNumber,
      });
      setSelectedSeat(seatNumber);
      setLockExpiresAt(res.lockExpiresAt);
      setSeats((prev) =>
        prev.map((s) =>
          s.seatNumber === seatNumber ? { ...s, status: "locked" } : s
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      const res = await api.post("/bookings/flight", {
        flightId: flight.id,
        date,
        seatNumber: selectedSeat,
      });
      onBooked?.(res.booking);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Select Travel Date & Seat</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", gap: 2, mb: 2, mt: 1, flexWrap: "wrap" }}>
          <TextField
            label="Travel Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().slice(0, 10) }}
            required
          />
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Class</InputLabel>
            <Select
              value={seatClass}
              label="Class"
              onChange={(e) => setSeatClass(e.target.value)}
            >
              <MenuItem value="Economy">Economy</MenuItem>
              <MenuItem value="Business">Business</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Typography variant="body2" sx={{ mb: 1 }}>
          Available = Cyan Green, Booked = Cyan Red
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Searching for {travelers} {travelers === 1 ? "traveler" : "travelers"}.
        </Typography>

        <Box className="plane-shell">
          <Box className="plane-nose">
            <Typography variant="subtitle2" sx={{ color: "#fff", fontWeight: 700 }}>
              {flight?.airline?.name || "Your Plane"} | {seatClass}
            </Typography>
            <Typography variant="caption" sx={{ color: "#d6e5ff" }}>
              Scroll to the back of the aircraft
            </Typography>
          </Box>

          <Box className="plane-body-scroll">
            {groupedRows.map((rowData) => {
              const seatKeys = ["A", "B", "C", "D", "E", "F"];
              return (
                <Box key={rowData.row} className="plane-row">
                  {seatKeys.map((key, idx) => {
                    const seat = rowData.cols[key];
                    const spacer = idx === 3;
                    if (spacer) {
                      return <Box key={`aisle-${rowData.row}`} className="aisle-space">✈</Box>;
                    }
                    if (!seat) {
                      return <Box key={`${rowData.row}-${key}-empty`} className="seat-empty" />;
                    }
                    const isBooked = seat.status === "booked" || seat.status === "locked";
                    const isSelected = selectedSeat === seat.seatNumber;
                    const bg = isBooked ? cyanRed : cyanGreen;
                    return (
                      <Button
                        key={seat.seatNumber}
                        size="small"
                        disabled={isBooked || loading || !date}
                        onClick={() => handleLockSeat(seat.seatNumber)}
                        className="seat-btn"
                        sx={{
                          color: "#002b2b",
                          border: isSelected ? "2px solid #003333" : "1px solid #55a",
                          backgroundColor: bg,
                          "&:hover": { backgroundColor: bg },
                        }}
                      >
                        {seat.seatNumber}
                      </Button>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Box>

        {lockExpiresAt ? (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Seat lock expires at: {new Date(lockExpiresAt).toLocaleTimeString()}
          </Typography>
        ) : null}

        {error ? (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        ) : null}

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmBooking}
            disabled={!date || !selectedSeat || isPastDateInput(date)}
          >
            Confirm Booking
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
