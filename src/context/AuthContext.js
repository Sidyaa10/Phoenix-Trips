import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("phoenixToken");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.user))
      .catch((err) => {
        // Keep token on transient/network errors so users are not logged out unexpectedly.
        if (err?.status === 401) {
          localStorage.removeItem("phoenixToken");
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === "admin",
      isAuthenticated: Boolean(user),
      openAuthDialog: () => setAuthDialogOpen(true),
      closeAuthDialog: () => setAuthDialogOpen(false),
      authDialogOpen,
      async signup(payload) {
        const res = await api.post("/auth/signup", payload);
        localStorage.setItem("phoenixToken", res.token);
        setUser(res.user);
        setAuthDialogOpen(false);
      },
      async login(payload) {
        const res = await api.post("/auth/login", payload);
        localStorage.setItem("phoenixToken", res.token);
        setUser(res.user);
        setAuthDialogOpen(false);
      },
      logout() {
        localStorage.removeItem("phoenixToken");
        setUser(null);
      },
    }),
    [user, loading, authDialogOpen]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used in AuthProvider");
  return ctx;
}
