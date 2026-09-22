import { getVersionedBase } from "./auth";

function unwrap(payload) {
  return payload?.data ?? payload;
}

export function getAdminUrl(path) {
  return `${getVersionedBase()}/admin${path}`;
}

export async function adminRequest(path, options = {}, token = "") {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token && token !== "cookie")
    headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(getAdminUrl(path), {
    ...options,
    headers,
    credentials: "include",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      payload?.message || payload?.error?.message || "Admin request failed",
    );
    error.status = response.status;
    error.code = payload?.code || payload?.error?.code;
    throw error;
  }
  return unwrap(payload);
}

export function listFrom(payload) {
  if (Array.isArray(payload)) return payload;
  return (
    payload?.items ||
    payload?.results ||
    payload?.announcements ||
    payload?.teams ||
    payload?.payments ||
    payload?.registrations ||
    []
  );
}
