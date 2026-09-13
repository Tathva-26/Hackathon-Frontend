"use client";

// Single place for all auth API + storage logic.
// Backend: hackathon-backend/routes/auth.js

export const TOKEN_KEY = "tathva-auth-token";
export const USER_KEY = "tathva-auth-user";

export function getApiBase() {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";
  return base.replace(/\/$/, "");
}

// POST /api/auth/google lives one level above the versioned /api/v1 base:
//   http://localhost:8080/api/v1  ->  http://localhost:8080/api/auth/google
export function getGoogleAuthUrl() {
  const base = getApiBase();
  const authBase = base.replace(/\/api\/v1\/?$/, "/api");
  return `${authBase.replace(/\/$/, "")}/auth/google`;
}

export function getSessionUrl() {
  const base = getApiBase();
  const authBase = base.replace(/\/api\/v1\/?$/, "/api");
  return `${authBase.replace(/\/$/, "")}/auth/me`;
}

export function loadSession() {
  if (typeof window === "undefined") return { token: "", user: null };
  try {
    return {
      token: window.localStorage.getItem(TOKEN_KEY) || "",
      user: JSON.parse(window.localStorage.getItem(USER_KEY) || "null"),
    };
  } catch {
    return { token: "", user: null };
  }
}

export function saveSession(token, user) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

// Exchange a Google ID token (credential) for our own JWT.
export async function exchangeGoogleCredential(credential) {
  const res = await fetch(getGoogleAuthUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.token || !data.user) {
    const err = new Error(data.message || data.hint || data.error || "Google authentication failed.");
    err.code = data.error;
    err.hint = data.hint;
    err.status = res.status;
    throw err;
  }
  return data; // { token, user, isNewUser, message }
}

export async function fetchSessionUser(token) {
  const res = await fetch(getSessionUrl(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Session expired");
  const data = await res.json();
  return data.user;
}
