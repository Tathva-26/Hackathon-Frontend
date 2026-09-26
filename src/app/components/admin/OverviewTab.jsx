"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import { useAdminRecord } from "./useAdminList";
import TrendChart from "./TrendChart";
import { STATUS_HELP, STATUS_LABELS, formatDate, plural, rupees } from "./format";

// Registration stages in the order a team moves through them.
const STAGES = [
  { status: "DRAFT", key: "draft", color: "stageDraft" },
  { status: "PAYMENT_PENDING", key: "paymentPending", color: "stagePending" },
  { status: "PAYMENT_FAILED", key: "paymentFailed", color: "stageFailed" },
  { status: "PAID", key: "paid", color: "stagePaid" },
  { status: "EXPIRED", key: "expired", color: "stageMuted" },
  { status: "REMOVED", key: "removed", color: "stageMuted" },
];

const UNPAID_KEYS = ["DRAFT", "PAYMENT_PENDING", "PAYMENT_FAILED"];

// Fills in fields that an older backend (before the admin rework) does not
// send, so the overview still renders instead of crashing. `outdated` marks
// that case so the page can say the backend needs updating.
function normalizeOverview(stats) {
  const reg = stats.registrations || {};
  const byStatus = reg.byStatus || {};
  const count = (status) => byStatus[status] || 0;
  const unpaid = reg.unpaid ?? UNPAID_KEYS.reduce((sum, status) => sum + count(status), 0);
  const paid = reg.paid ?? count("PAID");
  const expired = reg.expired ?? count("EXPIRED");
  const attempted = paid + unpaid + expired;
  const payments = stats.payments || {};

  return {
    outdated: !Array.isArray(stats.trend),
    teams: { total: 0, totalMembers: 0, ...stats.teams },
    users: { total: 0, ...stats.users },
    revenue: { formatted: "₹0", ...stats.revenue },
    announcements: { published: 0, drafts: 0, ...stats.announcements },
    payments: {
      confirmed: payments.confirmed ?? payments.byStatus?.CONFIRMED ?? 0,
      failed: payments.failed ?? payments.byStatus?.FAILED ?? 0,
      pending: payments.pending ?? payments.byStatus?.PENDING ?? 0,
    },
    registrations: {
      total: reg.total ?? 0,
      draft: reg.draft ?? count("DRAFT"),
      paymentPending: reg.paymentPending ?? count("PAYMENT_PENDING"),
      paymentFailed: reg.paymentFailed ?? count("PAYMENT_FAILED"),
      paid,
      expired,
      removed: reg.removed ?? count("REMOVED"),
      unpaid,
      outstandingPaise: reg.outstandingPaise ?? null,
      conversionPercent: reg.conversionPercent ?? (attempted ? Math.round((paid / attempted) * 1000) / 10 : 0),
    },
    trend: Array.isArray(stats.trend) ? stats.trend : [],
    topColleges: Array.isArray(stats.topColleges) ? stats.topColleges : [],
    recentPaidTeams: Array.isArray(stats.recentPaidTeams) ? stats.recentPaidTeams : [],
  };
}

export default function OverviewTab({ go }) {
  const [reloadKey, setReloadKey] = useState(0);
  const { data: stats, error, loading } = useAdminRecord("/overview", reloadKey);

  if (!stats) {
    return (
      <div className={styles.tableState}>
        {loading ? (
          <span>Loading overview…</span>
        ) : (
          <>
            <strong>Could not load the overview.</strong>
            <span>{error?.message}</span>
            <button className={styles.secondaryButton} onClick={() => setReloadKey((key) => key + 1)}>
              Try again
            </button>
          </>
        )}
      </div>
    );
  }

  const view = normalizeOverview(stats);
  const reg = view.registrations;
  const stageTotal = STAGES.reduce((sum, stage) => sum + (reg[stage.key] || 0), 0);

  const tiles = [
    {
      label: "Paid teams",
      value: view.teams.total,
      sub: `${plural(view.teams.totalMembers, "participant")}`,
      accent: "lime",
      onClick: () => go("teams"),
    },
    {
      label: "Revenue collected",
      value: view.revenue.formatted,
      sub: `${plural(view.payments.confirmed, "confirmed payment")}`,
      accent: "yellow",
      onClick: () => go("payments", { status: "CONFIRMED" }),
    },
    {
      label: "Unpaid teams",
      value: reg.unpaid,
      sub: reg.outstandingPaise === null ? "not paid yet" : `${rupees(reg.outstandingPaise)} still to collect`,
      accent: "coral",
      onClick: () => go("unpaid"),
    },
    {
      label: "Waiting on TIQR",
      value: reg.paymentPending,
      sub: "payment started, not confirmed",
      accent: "blue",
      onClick: () => go("registrations", { status: "PAYMENT_PENDING" }),
    },
    {
      label: "Registrations that paid",
      value: `${reg.conversionPercent}%`,
      sub: `${reg.paid} of ${reg.paid + reg.unpaid + reg.expired} teams`,
      accent: "plain",
      onClick: () => go("registrations"),
    },
    {
      label: "Accounts",
      value: view.users.total,
      sub: "people who signed in",
      accent: "plain",
      onClick: () => go("users"),
    },
  ];

  return (
    <div className={styles.overview}>
      {view.outdated && (
        <div className={styles.error} role="status">
          <strong>BACKEND OUT OF DATE</strong>
          <span>
            The API this console is connected to is running the old admin code, so charts, top colleges, Lookup, Users
            and CSV exports will not work. Deploy (or restart) the updated hackathon-backend.
          </span>
        </div>
      )}
      <div className={styles.tileGrid}>
        {tiles.map((tile) => (
          <button key={tile.label} className={`${styles.metric} ${styles[tile.accent] || ""}`} onClick={tile.onClick}>
            <span>{tile.label}</span>
            <strong>{tile.value}</strong>
            <small>{tile.sub} →</small>
          </button>
        ))}
      </div>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <span className={styles.eyebrow}>WHERE TEAMS ARE</span>
            <p className={styles.cardNote}>Every registration by its current stage. Click a stage to see those teams.</p>
          </div>
          <button className={styles.linkButton} onClick={() => go("unpaid")}>
            Follow up unpaid →
          </button>
        </div>
        {stageTotal > 0 && (
          <div className={styles.stageBar}>
            {STAGES.filter((stage) => reg[stage.key] > 0).map((stage) => (
              <span
                key={stage.status}
                className={styles[stage.color]}
                style={{ flexGrow: reg[stage.key] }}
                title={`${STATUS_LABELS[stage.status]}: ${reg[stage.key]}`}
              />
            ))}
          </div>
        )}
        <div className={styles.stageLegend}>
          {STAGES.map((stage) => (
            <button
              key={stage.status}
              onClick={() => go("registrations", { status: stage.status })}
              title={STATUS_HELP[stage.status]}
            >
              <i className={styles[stage.color]} />
              <span>{STATUS_LABELS[stage.status]}</span>
              <strong>{reg[stage.key] || 0}</strong>
            </button>
          ))}
          <button onClick={() => go("registrations")} className={styles.stageTotal}>
            <span>Total registrations</span>
            <strong>{reg.total}</strong>
          </button>
        </div>
      </section>

      {view.trend?.length > 0 && <TrendChart data={view.trend} />}

      <div className={styles.twoCol}>
        <section className={styles.card}>
          <span className={styles.eyebrow}>TOP COLLEGES (PAID TEAMS)</span>
          {view.topColleges.length === 0 ? (
            <p className={styles.cardNote}>No paid teams yet.</p>
          ) : (
            <ol className={styles.rankList}>
              {view.topColleges.map((college) => (
                <li key={college.name}>
                  <button onClick={() => go("teams", { college: college.name })}>
                    <span>{college.name}</span>
                    <small>{plural(college.participants, "participant")}</small>
                    <strong>{plural(college.teams, "team")}</strong>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className={styles.card}>
          <span className={styles.eyebrow}>RECENTLY PAID</span>
          {view.recentPaidTeams.length === 0 ? (
            <p className={styles.cardNote}>No paid teams yet.</p>
          ) : (
            <ol className={styles.rankList}>
              {view.recentPaidTeams.map((team) => (
                <li key={team.id}>
                  <button onClick={() => go("teams", { open: team.id })}>
                    <span>{team.teamName}</span>
                    <small>
                      {team.collegeName} · {formatDate(team.paidAt)}
                    </small>
                    <strong>{rupees(team.amountPaise)}</strong>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className={styles.miniStats}>
        <button onClick={() => go("payments", { status: "FAILED" })}>
          Failed payments <strong>{view.payments.failed}</strong>
        </button>
        <button onClick={() => go("payments", { status: "PENDING" })}>
          Pending payments <strong>{view.payments.pending}</strong>
        </button>
        <button onClick={() => go("announcements")}>
          Announcements live <strong>{view.announcements.published}</strong>
          {view.announcements.drafts > 0 && <small>{view.announcements.drafts} drafts</small>}
        </button>
      </div>
    </div>
  );
}
