"use client";

import { useEffect, useState } from "react";
import { adminRequest, buildQuery } from "../../lib/adminApi";

// Loads `/admin/<resource>?<params>` and reloads whenever params or reloadKey
// change. Keeps the previous rows while the next page loads, so the table does
// not flash empty.
export function useAdminList(resource, params, reloadKey = 0) {
  const query = buildQuery(params);
  const requestKey = `${resource}?${query}#${reloadKey}`;
  const [state, setState] = useState({
    key: null,
    data: [],
    pagination: null,
    totals: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    adminRequest(`/${resource}?${query}`)
      .then((payload) => {
        if (cancelled) return;
        setState({
          key: requestKey,
          data: payload.data || [],
          pagination: payload.pagination || null,
          totals: payload.totals || null,
          error: null,
        });
      })
      .catch((error) => {
        if (!cancelled) setState((current) => ({ ...current, key: requestKey, error }));
      });
    return () => {
      cancelled = true;
    };
  }, [resource, query, requestKey]);

  return { ...state, loading: state.key !== requestKey };
}

// Loads one record (e.g. `/teams/<id>`); `path` null means nothing to load.
export function useAdminRecord(path, reloadKey = 0) {
  const requestKey = path ? `${path}#${reloadKey}` : null;
  const [state, setState] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    if (!path) return undefined;
    let cancelled = false;
    adminRequest(path)
      .then((payload) => {
        if (!cancelled) setState({ key: requestKey, data: payload.data ?? null, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ key: requestKey, data: null, error });
      });
    return () => {
      cancelled = true;
    };
  }, [path, requestKey]);

  const current = state.key === requestKey;
  return {
    data: current ? state.data : null,
    error: current ? state.error : null,
    loading: Boolean(path) && !current,
  };
}

// The value, once it has stopped changing for `delay` ms (for search boxes).
export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Current time, refreshed every `interval` ms (for countdowns).
export function useNow(interval = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(timer);
  }, [interval]);
  return now;
}
