import { getVersionedBase } from "./auth";

// Admin API client. The session is the HttpOnly cookie set at sign-in, so
// every request goes with credentials: "include".

export function getAdminUrl(path) {
  return `${getVersionedBase()}/admin${path}`;
}

// Builds a query string from params, leaving out empty values.
export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  return search.toString();
}

async function toError(response, fallback) {
  const payload = await response.json().catch(() => ({}));
  const error = new Error(payload?.error?.message || payload?.message || fallback);
  error.status = response.status;
  error.code = payload?.error?.code || payload?.code;
  return error;
}

// Returns the full response body ({ data, pagination, totals, ... }).
export async function adminRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body) headers.set("Content-Type", "application/json");

  const response = await fetch(getAdminUrl(path), {
    ...options,
    headers,
    credentials: "include",
  });
  if (!response.ok) throw await toError(response, "Admin request failed");
  return response.json().catch(() => ({}));
}

// Downloads a CSV export as a file named `filename`.
export async function adminDownload(path, filename) {
  const response = await fetch(getAdminUrl(path), { credentials: "include" });
  if (!response.ok) throw await toError(response, "Export failed");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Fetches every page of a list endpoint (up to maxPages * 100 rows). Used for
// "copy all" actions that should cover the whole filter, not just one page.
export async function adminFetchAll(resource, params = {}, maxPages = 30) {
  const rows = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const payload = await adminRequest(`/${resource}?${buildQuery({ ...params, page, limit: 100 })}`);
    rows.push(...(payload.data || []));
    if (page >= (payload.pagination?.totalPages || 1)) break;
  }
  return rows;
}
