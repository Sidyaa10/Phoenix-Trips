import React, { useEffect, useState } from "react";
import { Container, Paper, Typography, Box, Chip } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import "./MyBookings.css";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const statusColor = {
  Pending: "warning",
  Approved: "success",
  Rejected: "error",
  Cancelled: "default",
  Delayed: "info",
};

const MyBookings = () => {
  const { isAuthenticated, openAuthDialog, isAdmin, loading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      openAuthDialog();
      return;
    }
    api
      .get("/bookings")
      .then((res) => setBookings(res.bookings || []))
      .catch((err) => setError(err.message));
  }, [isAuthenticated, openAuthDialog, loading]);

  return (
    <Container className="bookings-container">
      <Typography variant="h4" className="page-title">
        {isAdmin ? "All Bookings" : "My Bookings"}
      </Typography>

      {error ? <Typography color="error">{error}</Typography> : null}

      {bookings.map((booking) => (
        <Paper key={booking.id} elevation={3} className="ticket-container" sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Booking ID: {booking.bookingCode}</Typography>
            <Chip label={booking.status} color={statusColor[booking.status] || "default"} />
          </Box>

          {booking.type === "flight" ? (
            <>
              <Typography variant="body1">
                {booking.airline} | {booking.flightNumber}
              </Typography>
              <Typography variant="body2">
                {booking.fromCity} ({booking.airportCodes?.from}) - {booking.toCity} ({booking.airportCodes?.to})
              </Typography>
              <Typography variant="body2">
                Seat: {booking.seatNumber || "-"} | Date: {booking.date}
              </Typography>
            </>
          ) : null}

          {booking.type === "hotel" ? (
            <>
              <Typography variant="body1">{booking.hotelName}</Typography>
              <Typography variant="body2">
                Tier: {booking.roomTier} | Date: {booking.date}
              </Typography>
            </>
          ) : null}

          {booking.type === "airbnb" ? (
            <>
              <Typography variant="body1">{booking.listingName}</Typography>
              <Typography variant="body2">
                Location: {booking.location} | Date: {booking.date}
              </Typography>
            </>
          ) : null}

          <Box sx={{ mt: 2 }}>
            <QRCodeSVG value={JSON.stringify(booking)} size={96} level="M" />
          </Box>
        </Paper>
      ))}
    </Container>
  );
};

export default MyBookings;
