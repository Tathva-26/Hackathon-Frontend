"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearSession, fetchSessionUser, loadSession, saveSession, fetchMyRegistration } from "../lib/auth";

const AuthContext = createContext(null);

// Leaders with a team and members of someone else's team both get
// "Dashboard" in the navbar rather than an invitation to register.
function hasTeam(regData) {
  return Boolean((regData.registered && regData.status) || regData.isTeamMember);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("loading"); // loading | authenticated | unauthenticated
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

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
        return fetchMyRegistration(savedToken);
      })
      .then((regData) => {
        setIsRegistered(hasTeam(regData));
      })
      .catch(() => {
        // Our JWT expired/invalid -> force re-login instead of silent failures later.
        clearSession();
        setToken("");
        setUser(null);
        setStatus("unauthenticated");
        setIsRegistered(false);
      });
  }, []);

  const login = useCallback((newToken, newUser) => {
    saveSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
    setError("");
    setStatus("authenticated");
    fetchMyRegistration(newToken)
      .then(regData => setIsRegistered(hasTeam(regData)))
      .catch(() => setIsRegistered(false));
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken("");
    setUser(null);
    setStatus("unauthenticated");
    setIsRegistered(false);
  }, []);

  const value = useMemo(
    () => ({ user, token, status, error, isRegistered, setIsRegistered, setError, login, logout }),
    [user, token, status, error, isRegistered, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
