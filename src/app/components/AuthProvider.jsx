"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearSession, fetchSessionUser, loadSession, saveSession } from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("loading"); // loading | authenticated | unauthenticated
  const [error, setError] = useState("");

  // Restore session on page reload and validate it against GET /api/auth/me.
  useEffect(() => {
    const { token: savedToken, user: savedUser } = loadSession();
    if (!savedToken || !savedUser) {
      setStatus("unauthenticated");
      return;
    }
    setToken(savedToken);
    setUser(savedUser);
    setStatus("authenticated");
    fetchSessionUser(savedToken)
      .then((freshUser) => {
        setUser(freshUser);
        saveSession(savedToken, freshUser);
      })
      .catch(() => {
        // Our JWT expired/invalid -> force re-login instead of silent failures later.
        clearSession();
        setToken("");
        setUser(null);
        setStatus("unauthenticated");
      });
  }, []);

  const login = useCallback((newToken, newUser) => {
    saveSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
    setError("");
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken("");
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ user, token, status, error, setError, login, logout }),
    [user, token, status, error, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
