"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "../AuthProvider";
import GoogleSignIn from "../GoogleSignIn";
import { adminRequest } from "../../lib/adminApi";
import styles from "../admin.module.css";
import OverviewTab from "./OverviewTab";
import TeamsTab from "./TeamsTab";
import RegistrationsTab from "./RegistrationsTab";
import PaymentsTab from "./PaymentsTab";
import LookupTab from "./LookupTab";
import UsersTab from "./UsersTab";
import AnnouncementsTab from "./AnnouncementsTab";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "unpaid", label: "Unpaid teams" },
  { id: "teams", label: "Teams" },
  { id: "registrations", label: "Registrations" },
  { id: "payments", label: "Payments" },
  { id: "lookup", label: "Lookup" },
  { id: "users", label: "Users" },
  { id: "announcements", label: "Announcements" },
];

const HEALTH_INTERVAL_MS = 60000;
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// The open tab and its preset filters live in the URL hash
// (e.g. #registrations?status=PAYMENT_PENDING), so links between tabs, the
// browser back button and a page refresh all keep the view.
function subscribeHash(callback) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function parseHash(hash) {
  const [tab, query = ""] = hash.replace(/^#/, "").split("?");
  const known = TABS.some((item) => item.id === tab);
  return {
    tab: known ? tab : "overview",
    params: Object.fromEntries(new URLSearchParams(query)),
  };
}

export function navigate(tab, params = {}) {
  const query = new URLSearchParams(params).toString();
  window.location.hash = query ? `${tab}?${query}` : tab;
}

export default function AdminShell() {
  const { user, status: authStatus, logout } = useAuth();
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => "",
  );
  const { tab, params } = parseHash(hash);
  const [banner, setBanner] = useState(null);
  const [health, setHealth] = useState({ state: "checking" });

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) return undefined;
    let cancelled = false;
    const check = () =>
      adminRequest("/health")
        .then(() => !cancelled && setHealth({ state: "ok", checkedAt: new Date() }))
        .catch((error) => {
          if (cancelled) return;
          // 404: the API answered but has no /admin/health, i.e. it is still
          // running the admin code from before this console's rework.
          const state = error.status === 401 ? "session" : error.status === 404 ? "outdated" : "down";
          setHealth({ state, error, checkedAt: new Date() });
        });
    check();
    const timer = setInterval(check, HEALTH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isAdmin]);

  const notify = useCallback((message) => setBanner({ type: "notice", message }), []);
  const reportError = useCallback((error) => {
    setBanner({
      type: "error",
      status: error?.status,
      message: error?.message || "Something went wrong.",
    });
  }, []);

  if (authStatus === "loading") {
    return <main className={styles.centerState}>Loading admin session…</main>;
  }

  if (authStatus !== "authenticated") {
    return (
      <main className={styles.centerState}>
        <div>
          <span className={styles.eyebrow}>TATHACK &apos;26 · ADMIN</span>
          <h1>Sign in to continue.</h1>
          <p>Use the Google account that has admin access.</p>
          {googleClientId ? (
            <div className={styles.signIn}>
              <GoogleSignIn />
            </div>
          ) : (
            <p>Google sign-in is not configured for this build.</p>
          )}
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className={styles.centerState}>
        <div>
          <span className={styles.eyebrow}>403 / FORBIDDEN</span>
          <h1>This console is restricted.</h1>
          <p>
            You are signed in as {user?.email}, which is not an admin account.
          </p>
          <button className={styles.secondaryButton} onClick={logout}>
            Sign out
          </button>
        </div>
      </main>
    );
  }

  const title = TABS.find((item) => item.id === tab)?.label;
  const tabProps = { params, go: navigate, notify, reportError };

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>T</span>
          <div>
            <strong>TatHack</strong>
            <small>ADMIN CONSOLE</small>
          </div>
        </div>
        <div className={styles.sideLabel}>Workspace</div>
        <nav className={styles.tabs} aria-label="Admin sections">
          {TABS.map((item, index) => (
            <button
              key={item.id}
              className={tab === item.id ? styles.activeTab : ""}
              onClick={() => {
                setBanner(null);
                navigate(item.id);
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFoot}>
          <div className={styles.userBubble}>{user?.name?.charAt(0) || "A"}</div>
          <div>
            <strong>{user?.name || "Admin"}</strong>
            <small>{user?.email}</small>
          </div>
          <button className={styles.logout} onClick={logout} aria-label="Sign out" title="Sign out">
            ⏻
          </button>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.eyebrow}>CONTROL ROOM / 2026</span>
            <h1>{title}</h1>
          </div>
          <div
            className={`${styles.live} ${health.state === "ok" ? "" : styles.liveBad}`}
            title={health.checkedAt ? `Last checked ${health.checkedAt.toLocaleTimeString()}` : undefined}
          >
            <i />
            {health.state === "ok"
              ? "API CONNECTED"
              : health.state === "checking"
                ? "CHECKING API…"
                : health.state === "session"
                  ? "SESSION EXPIRED"
                  : health.state === "outdated"
                    ? "BACKEND OUT OF DATE"
                    : "API UNREACHABLE"}
          </div>
        </header>

        {(banner || health.state === "session") && (
          <div className={banner?.type === "notice" ? styles.notice : styles.error} role="status">
            {health.state === "session" || banner?.status === 401 ? (
              <>
                <strong>SESSION EXPIRED</strong>
                <span>Your admin session has ended. Sign in again to continue.</span>
                <button className={styles.inlineAction} onClick={logout}>
                  Sign in again
                </button>
              </>
            ) : (
              <>
                {banner.type === "error" && <strong>{banner.status === 403 ? "403 / FORBIDDEN" : "ERROR"}</strong>}
                <span>{banner.message}</span>
                <button onClick={() => setBanner(null)} aria-label="Dismiss">
                  ×
                </button>
              </>
            )}
          </div>
        )}

        {/* Keyed by the hash so following a link to a preset view starts fresh. */}
        <div key={hash} className={styles.view}>
          {tab === "overview" && <OverviewTab {...tabProps} />}
          {tab === "unpaid" && <RegistrationsTab {...tabProps} mode="unpaid" />}
          {tab === "teams" && <TeamsTab {...tabProps} />}
          {tab === "registrations" && <RegistrationsTab {...tabProps} mode="all" />}
          {tab === "payments" && <PaymentsTab {...tabProps} />}
          {tab === "lookup" && <LookupTab {...tabProps} />}
          {tab === "users" && <UsersTab {...tabProps} />}
          {tab === "announcements" && <AnnouncementsTab {...tabProps} />}
        </div>
      </section>
    </main>
  );
}
