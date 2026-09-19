"use client";

// Single place for all auth API + storage logic.
// Backend: hackathon-backend/routes/auth.js

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
      token: "cookie", // Token is managed securely by the browser via HttpOnly cookies
      user: JSON.parse(window.localStorage.getItem(USER_KEY) || "null"),
    };
  } catch {
    return { token: "", user: null };
  }
}

export function saveSession(token, user) {
  // Token is implicitly saved in an HttpOnly cookie by the backend response
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearSession() {
  window.localStorage.removeItem(USER_KEY);
  // Tell backend to clear the HttpOnly cookie
  await fetch(`${getVersionedBase()}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
}

// Exchange a Google ID token (credential) for our own HttpOnly cookie session.
export async function exchangeGoogleCredential(credential) {
  const res = await fetch(getGoogleAuthUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token: credential }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.user) {
    const err = new Error(data.message || data.hint || data.error || "Google authentication failed.");
    err.code = data.error;
    err.hint = data.hint;
    err.status = res.status;
    throw err;
  }
  // The backend no longer returns `token` in the body. We mock it so UI components don't crash.
  return { ...data, token: "cookie" }; // { user, isNewUser, message, token: "cookie" }
}

export async function fetchSessionUser(token) {
  const res = await fetch(getSessionUrl(), {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Session expired");
  return res.json();
}

// GET /api/v1/registrations/me - the leader's current team details.
export async function fetchMyRegistration(token) {
  const res = await fetch(`${getVersionedBase()}/registrations/me`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Could not load registration status");
  return res.json();
}
