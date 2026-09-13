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

// Backend serves every route under a versioned prefix (/api/v1).
// Accept both ".../api" and ".../api/v1" base URLs and normalize them.
export function getVersionedBase() {
  const base = getApiBase();
  return /\/v\d+\/?$/.test(base) ? base : `${base}/v1`;
}

export function getGoogleAuthUrl() {
  return `${getVersionedBase()}/auth/google`;
}

export function getSessionUrl() {
  return `${getVersionedBase()}/auth/me`;
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
    body: JSON.stringify({ token: credential }),
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
  return res.json();
}
