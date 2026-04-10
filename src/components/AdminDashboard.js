import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["Pending", "Approved", "Rejected", "Cancelled", "Delayed"];
const FLIGHT_STATUSES = ["Active", "Delayed", "Cancelled", "Fully Booked"];

export default function AdminDashboard() {
  const { isAdmin, openAuthDialog, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [flights, setFlights] = useState([]);
  const [cities, setCities] = useState([]);
  const [newAirline, setNewAirline] = useState("");
  const [newFlight, setNewFlight] = useState({
    flightNumber: "",
    fromCity: "Mumbai",
    toCity: "Dubai",
    airlineId: "",
    departureTime: "10:00",
    arrivalTime: "12:00",
    duration: "2h 00m",
    basePrice: 10000,
  });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [u, b, a, f, c] = await Promise.all([
        api.get("/bookings/admin/users"),
        api.get("/bookings"),
        api.get("/meta/airlines?includeDisabled=true"),
        api.get("/flights"),
        api.get("/meta/cities"),
      ]);
      setUsers(u.users || []);
      setBookings(b.bookings || []);
      setAirlines(a.airlines || []);
      setFlights(f.flights || []);
      setCities(c.cities || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      openAuthDialog();
      return;
    }
    load();
  }, [isAdmin, openAuthDialog, loading]);

  const updateStatus = async (bookingId, status) => {
    await api.patch(`/bookings/${bookingId}/status`, { status });
    await load();
  };

  const addAirline = async () => {
    if (!newAirline.trim()) return;
    await api.post("/admin/airlines", { name: newAirline.trim(), activeStatus: true });
    setNewAirline("");
    await load();
  };

  const toggleAirline = async (airline) => {
    await api.put(`/admin/airlines/${airline._id}`, {
      activeStatus: !airline.activeStatus,
    });
    await load();
  };

  const updateFlightStatus = async (flightId, status) => {
    await api.put(`/flights/${flightId}`, { status });
    await load();
  };

  const createFlight = async () => {
    await api.post("/flights", {
      ...newFlight,
      basePrice: Number(newFlight.basePrice),
    });
    setNewFlight((prev) => ({ ...prev, flightNumber: "" }));
    await load();
  };

  if (loading || !isAdmin) return null;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Admin Dashboard
      </Typography>
      {error ? (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      ) : null}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Users</Typography>
            {users.map((u) => (
              <Typography key={u._id} variant="body2">
                {u.name} - {u.email} ({u.role})
              </Typography>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Airlines</Typography>
            <Box sx={{ display: "flex", gap: 1, my: 1 }}>
              <TextField
                size="small"
                value={newAirline}
                onChange={(e) => setNewAirline(e.target.value)}
                placeholder="Add airline"
              />
              <Button variant="contained" onClick={addAirline}>
                Add
              </Button>
            </Box>
            {airlines.map((a) => (
              <Box key={a._id} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">{a.name}</Typography>
                <Button size="small" onClick={() => toggleAirline(a)}>
                  {a.activeStatus ? "Disable" : "Enable"}
                </Button>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Flight Route Management</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, my: 1 }}>
              <TextField
                size="small"
                label="Flight No"
                value={newFlight.flightNumber}
                onChange={(e) => setNewFlight({ ...newFlight, flightNumber: e.target.value })}
              />
              <Select
                size="small"
                value={newFlight.fromCity}
                onChange={(e) => setNewFlight({ ...newFlight, fromCity: e.target.value })}
              >
                {cities.map((c) => (
                  <MenuItem key={`from-${c.city}`} value={c.city}>
                    {c.city}
                  </MenuItem>
                ))}
              </Select>
              <Select
                size="small"
                value={newFlight.toCity}
                onChange={(e) => setNewFlight({ ...newFlight, toCity: e.target.value })}
              >
                {cities.map((c) => (
                  <MenuItem key={`to-${c.city}`} value={c.city}>
                    {c.city}
                  </MenuItem>
                ))}
              </Select>
              <Select
                size="small"
                value={newFlight.airlineId}
                onChange={(e) => setNewFlight({ ...newFlight, airlineId: e.target.value })}
              >
                {airlines.map((a) => (
                  <MenuItem key={a._id} value={a._id}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                size="small"
                label="Depart"
                value={newFlight.departureTime}
                onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })}
              />
              <TextField
                size="small"
                label="Arrive"
                value={newFlight.arrivalTime}
                onChange={(e) => setNewFlight({ ...newFlight, arrivalTime: e.target.value })}
              />
              <TextField
                size="small"
                label="Duration"
                value={newFlight.duration}
                onChange={(e) => setNewFlight({ ...newFlight, duration: e.target.value })}
              />
              <TextField
                size="small"
                label="Base Price"
                type="number"
                value={newFlight.basePrice}
                onChange={(e) => setNewFlight({ ...newFlight, basePrice: e.target.value })}
              />
            </Box>
            <Button variant="contained" onClick={createFlight} disabled={!newFlight.flightNumber || !newFlight.airlineId}>
              Add Route
            </Button>

            {flights.map((f) => (
              <Box
                key={f.id}
                sx={{
                  borderBottom: "1px solid #eee",
                  py: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {f.flightNumber} | {f.fromCity} - {f.toCity} | {f.airline?.name}
                </Typography>
                <Select
                  size="small"
                  value={f.status}
                  onChange={(e) => updateFlightStatus(f.id, e.target.value)}
                >
                  {FLIGHT_STATUSES.map((s) => (
                    <MenuItem value={s} key={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Bookings Approval</Typography>
            {bookings.map((b) => (
              <Box
                key={b.id}
                sx={{
                  borderBottom: "1px solid #eee",
                  py: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {b.bookingCode} | {b.type} | {b.status}
                </Typography>
                <Select
                  size="small"
                  value={b.status}
                  onChange={(e) => updateStatus(b.id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <MenuItem value={s} key={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
