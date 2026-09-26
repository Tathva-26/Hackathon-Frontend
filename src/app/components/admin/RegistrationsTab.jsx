"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import { adminDownload, adminFetchAll, buildQuery } from "../../lib/adminApi";
import { fetchPaymentStatus } from "../../lib/auth";
import { useAdminList, useAdminRecord, useDebounced, useNow } from "./useAdminList";
import DataTable from "./DataTable";
import Pagination from "./Pagination";
import SidePanel, { DetailRows, PanelState } from "./SidePanel";
import MemberList from "./MemberList";
import StatusBadge from "./StatusBadge";
import ContactLinks, { CopyButton } from "./ContactLinks";
import {
  REGISTRATION_STATUSES,
  STATUS_HELP,
  STATUS_LABELS,
  UNPAID_STATUSES,
  dialNumber,
  displayPhone,
  formatDate,
  isUnpaid,
  plural,
  rupees,
  timeAgo,
  timeLeft,
} from "./format";

const PAGE_SIZE = 25;

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "updated", label: "Recently updated" },
  { value: "amount", label: "Highest amount" },
];

const UNPAID_FILTERS = [
  { value: UNPAID_STATUSES, label: "All unpaid" },
  { value: "DRAFT", label: "Draft (never started paying)" },
  { value: "PAYMENT_PENDING", label: "Payment pending" },
  { value: "PAYMENT_FAILED", label: "Payment failed" },
];

const ALL_FILTERS = [
  { value: "", label: "All statuses" },
  { value: UNPAID_STATUSES, label: "Unpaid (draft, pending, failed)" },
  ...REGISTRATION_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
];

function leaderOf(registration) {
  return registration.members?.find((m) => m.isLeader) || null;
}

function bookingUidOf(registration) {
  return registration.payment?.tiqrBookingUid || registration.tiqrBookingUid || null;
}

// mode "unpaid": the follow-up list of teams that still owe payment.
// mode "all": every registration attempt, any status.
export default function RegistrationsTab({ mode, params, go, notify, reportError }) {
  const unpaidMode = mode === "unpaid";
  const [search, setSearch] = useState(params.search || "");
  const [status, setStatus] = useState(params.status ?? (unpaidMode ? UNPAID_STATUSES : ""));
  const [sort, setSort] = useState(params.sort || "newest");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(params.open || null);
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState("");
  const now = useNow();

  const filters = { status, search: useDebounced(search.trim()), sort };
  const list = useAdminList("registrations", { ...filters, page, limit: PAGE_SIZE }, reloadKey);

  // A preset from a link (e.g. one stage from the overview) may not be in the
  // dropdown; it is added so the select can show it.
  const statusOptions = [...(unpaidMode ? UNPAID_FILTERS : ALL_FILTERS)];
  if (!statusOptions.some((option) => option.value === status)) {
    statusOptions.push({ value: status, label: status.split(",").map((s) => STATUS_LABELS[s] || s).join(" + ") });
  }

  const exportCsv = async () => {
    setBusy("export");
    try {
      await adminDownload(
        `/export/registrations.csv?${buildQuery(filters)}`,
        unpaidMode ? "tathack-unpaid-teams.csv" : "tathack-registrations.csv",
      );
    } catch (error) {
      reportError(error);
    } finally {
      setBusy("");
    }
  };

  // Copies every leader phone/email for the whole filter (all pages), ready
  // to paste into a WhatsApp broadcast or an email's BCC field.
  const copyAll = async (field) => {
    setBusy(field);
    try {
      const rows = await adminFetchAll("registrations", filters);
      const values = [
        ...new Set(
          rows
            .map(leaderOf)
            .filter(Boolean)
            .map((leader) => (field === "phone" ? dialNumber(leader.phone) : leader.email))
            .filter(Boolean),
        ),
      ];
      await navigator.clipboard.writeText(values.join(field === "phone" ? "\n" : ", "));
      notify(`Copied ${plural(values.length, field === "phone" ? "leader phone number" : "leader email")} to the clipboard.`);
    } catch (error) {
      reportError(error);
    } finally {
      setBusy("");
    }
  };

  const columns = [
    {
      key: "team",
      header: "Team",
      render: (reg) => (
        <>
          <strong>{reg.teamName}</strong>
          <small>{reg.collegeName}</small>
        </>
      ),
    },
    {
      key: "leader",
      header: "Leader",
      render: (reg) => {
        const leader = leaderOf(reg);
        return (
          <>
            <strong>{leader?.name || reg.leader?.name || "–"}</strong>
            <small>{leader?.email || reg.leader?.email}</small>
          </>
        );
      },
    },
    {
      key: "phone",
      header: "Leader phone",
      render: (reg) => {
        const leader = leaderOf(reg);
        return (
          <>
            <span className={styles.nowrap}>{displayPhone(leader?.phone)}</span>
            <ContactLinks
              phone={leader?.phone}
              name={leader?.name}
              teamName={reg.teamName}
              amount={rupees(reg.amountPaise)}
              kind={isUnpaid(reg.status) ? "reminder" : "general"}
              compact
            />
          </>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (reg) => {
        const left = reg.status === "PAYMENT_PENDING" ? timeLeft(reg.expiresAt, now) : null;
        return (
          <>
            <StatusBadge value={reg.status} />
            {left && <small className={styles.countdown}>retry opens in {left.replace(" left", "")}</small>}
          </>
        );
      },
    },
    { key: "size", header: "Size", render: (reg) => plural(reg.memberCount, "member") },
    {
      key: "amount",
      header: unpaidMode ? "Due" : "Amount",
      render: (reg) => <strong>{rupees(reg.amountPaise)}</strong>,
    },
    {
      key: "created",
      header: "Registered",
      render: (reg) => (
        <>
          <span title={formatDate(reg.createdAt)}>{timeAgo(reg.createdAt, now)}</span>
          <small>updated {timeAgo(reg.updatedAt, now)}</small>
        </>
      ),
    },
  ];

  const total = list.pagination?.total ?? 0;
  const summary = unpaidMode
    ? `${plural(total, "unpaid team")} · ${rupees(list.totals?.amountPaise ?? 0)} to collect`
    : `${plural(total, "registration")} · ${rupees(list.totals?.amountPaise ?? 0)} in fees`;

  return (
    <div className={styles.resource}>
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Team, college, member name, email or phone"
            aria-label="Search registrations"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
          >
            {statusOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            aria-label="Sort"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.toolbarActions}>
          <button className={styles.secondaryButton} onClick={() => copyAll("phone")} disabled={Boolean(busy) || total === 0}>
            {busy === "phone" ? "Copying…" : "Copy leader phones"}
          </button>
          <button className={styles.secondaryButton} onClick={() => copyAll("email")} disabled={Boolean(busy) || total === 0}>
            {busy === "email" ? "Copying…" : "Copy leader emails"}
          </button>
          <button className={styles.primaryButton} onClick={exportCsv} disabled={Boolean(busy) || total === 0}>
            {busy === "export" ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </div>
      <p className={styles.tabHint}>
        {unpaidMode
          ? "Teams that registered but have not paid. Use Call / WhatsApp to send a pre-written payment reminder, or copy every leader's number or email at once. Click a team for all members' details."
          : "Every registration attempt, whatever its status. Hover a status to see what it means."}
      </p>

      <DataTable
        columns={columns}
        rows={list.data}
        loading={list.loading}
        error={list.error}
        onRetry={() => setReloadKey((key) => key + 1)}
        onRowClick={(reg) => setOpenId(reg.id)}
        selectedId={openId}
        emptyTitle={unpaidMode && !filters.search ? "Everyone has paid. 🎉" : "No matching registrations."}
      />
      <Pagination pagination={list.pagination} page={page} onPage={setPage} summary={summary} />

      {openId && (
        <RegistrationPanel
          registrationId={openId}
          go={go}
          now={now}
          onClose={() => setOpenId(null)}
          onChanged={(message) => {
            notify(message);
            setReloadKey((key) => key + 1);
          }}
        />
      )}
    </div>
  );
}

function RegistrationPanel({ registrationId, go, now, onClose, onChanged }) {
  const [reloadKey, setReloadKey] = useState(0);
  const { data: reg, loading, error } = useAdminRecord(`/registrations/${registrationId}`, reloadKey);
  const [check, setCheck] = useState({ busy: false, error: "" });

  const bookingUid = reg ? bookingUidOf(reg) : null;
  const canRecheck = reg && bookingUid && ["PAYMENT_PENDING", "PAYMENT_FAILED"].includes(reg.status);

  const recheck = async () => {
    setCheck({ busy: true, error: "" });
    try {
      const result = await fetchPaymentStatus(bookingUid);
      setCheck({ busy: false, error: "" });
      setReloadKey((key) => key + 1);
      onChanged(
        result.status === "CONFIRMED"
          ? `TIQR confirmed the payment for "${reg.teamName}". It is now a paid team.`
          : `TIQR still reports this payment as ${STATUS_LABELS[result.status] || result.status}.`,
      );
    } catch (err) {
      setCheck({ busy: false, error: err.message });
    }
  };

  const left = reg?.status === "PAYMENT_PENDING" ? timeLeft(reg.expiresAt, now) : null;
  const unpaid = reg && isUnpaid(reg.status);

  return (
    <SidePanel
      eyebrow="REGISTRATION"
      title={reg?.teamName || "Registration"}
      onClose={onClose}
      footer={
        reg && (
          <>
            {reg.team?.id && (
              <button className={styles.secondaryButton} onClick={() => go("teams", { open: reg.team.id })}>
                Open paid team
              </button>
            )}
            {reg.payment?.id && (
              <button className={styles.secondaryButton} onClick={() => go("payments", { open: reg.payment.id })}>
                Open payment
              </button>
            )}
            {canRecheck && (
              <button className={styles.primaryButton} onClick={recheck} disabled={check.busy}>
                {check.busy ? "Checking with TIQR…" : "Re-check with TIQR"}
              </button>
            )}
          </>
        )
      }
    >
      <PanelState loading={loading} error={error} />
      {reg && (
        <>
          <div className={styles.panelStatus}>
            <StatusBadge value={reg.status} />
            <span>{STATUS_HELP[reg.status]}</span>
          </div>
          {canRecheck && (
            <p className={styles.panelNote}>
              If the team says they paid, &quot;Re-check with TIQR&quot; asks TIQR directly and updates the status.
              {left && ` Their payment window closes in ${left.replace(" left", "")}; after that they can try paying again.`}
            </p>
          )}
          {check.error && <p className={styles.panelError}>{check.error}</p>}
          <DetailRows
            rows={[
              { label: "College", value: reg.collegeName },
              { label: "Team size", value: plural(reg.memberCount, "member") },
              { label: unpaid ? "Amount due" : "Amount", value: rupees(reg.amountPaise) },
              { label: "Registered", value: formatDate(reg.createdAt) },
              { label: "Last updated", value: formatDate(reg.updatedAt) },
              { label: "Payment window ends", value: reg.expiresAt && formatDate(reg.expiresAt) },
              { label: "Payment", value: reg.payment && <StatusBadge value={reg.payment.status} /> },
              { label: "Paid on", value: reg.payment?.paidAt && formatDate(reg.payment.paidAt) },
              {
                label: "TIQR booking",
                value: bookingUid && (
                  <span className={styles.inlineCopy}>
                    <code>{bookingUid}</code>
                    <CopyButton text={bookingUid} />
                  </span>
                ),
              },
              { label: "Signed-in leader", value: reg.leader && `${reg.leader.name} (${reg.leader.email})` },
            ]}
          />
          <MemberList
            members={reg.members}
            teamName={reg.teamName}
            amount={rupees(reg.amountPaise)}
            kind={unpaid ? "reminder" : "general"}
          />
        </>
      )}
    </SidePanel>
  );
}
