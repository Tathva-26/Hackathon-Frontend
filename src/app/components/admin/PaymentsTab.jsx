"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import { fetchPaymentStatus } from "../../lib/auth";
import { useAdminList, useAdminRecord, useDebounced } from "./useAdminList";
import DataTable from "./DataTable";
import Pagination from "./Pagination";
import SidePanel, { DetailRows, PanelState } from "./SidePanel";
import MemberList from "./MemberList";
import StatusBadge from "./StatusBadge";
import { CopyButton } from "./ContactLinks";
import { PAYMENT_STATUSES, STATUS_LABELS, formatDate, plural, rupees, timeAgo } from "./format";

const PAGE_SIZE = 25;

export default function PaymentsTab({ params, go, notify }) {
  const [search, setSearch] = useState(params.search || "");
  const [status, setStatus] = useState(params.status || "");
  const [from, setFrom] = useState(params.from || "");
  const [to, setTo] = useState(params.to || "");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(params.open || null);
  const [reloadKey, setReloadKey] = useState(0);

  const filters = { search: useDebounced(search.trim()), status, from, to };
  const list = useAdminList("payments", { ...filters, page, limit: PAGE_SIZE }, reloadKey);

  const change = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const columns = [
    {
      key: "team",
      header: "Team",
      render: (payment) => (
        <>
          <strong>{payment.registration?.teamName || "No team linked"}</strong>
          <small>{payment.registration?.leader?.email || payment.registration?.collegeName}</small>
        </>
      ),
    },
    { key: "status", header: "Status", render: (payment) => <StatusBadge value={payment.status} /> },
    { key: "amount", header: "Amount", render: (payment) => <strong>{rupees(payment.amountPaise)}</strong> },
    {
      key: "booking",
      header: "TIQR booking",
      render: (payment) => (
        <>
          <code className={styles.mono}>{payment.tiqrBookingUid}</code>
          {payment.tiqrBookingId && <small>#{payment.tiqrBookingId}</small>}
        </>
      ),
    },
    {
      key: "when",
      header: "Paid / started",
      render: (payment) => (
        <>
          <span title={formatDate(payment.paidAt || payment.createdAt)}>
            {payment.paidAt ? `Paid ${timeAgo(payment.paidAt)}` : `Started ${timeAgo(payment.createdAt)}`}
          </span>
          <small>{formatDate(payment.paidAt || payment.createdAt)}</small>
        </>
      ),
    },
  ];

  const total = list.pagination?.total ?? 0;

  return (
    <div className={styles.resource}>
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <input
            type="search"
            value={search}
            onChange={change(setSearch)}
            placeholder="Booking ID, team name or leader email"
            aria-label="Search payments"
          />
          <select value={status} onChange={change(setStatus)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {PAYMENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
          <label className={styles.dateField}>
            From
            <input type="date" value={from} max={to || undefined} onChange={change(setFrom)} />
          </label>
          <label className={styles.dateField}>
            To
            <input type="date" value={to} min={from || undefined} onChange={change(setTo)} />
          </label>
          {(from || to) && (
            <button
              className={styles.linkButton}
              onClick={() => {
                setFrom("");
                setTo("");
                setPage(1);
              }}
            >
              Clear dates
            </button>
          )}
        </div>
      </div>
      <p className={styles.tabHint}>
        Every TIQR checkout that was started. Dates are India time and filter by when the payment was started.
      </p>

      <DataTable
        columns={columns}
        rows={list.data}
        loading={list.loading}
        error={list.error}
        onRetry={() => setReloadKey((key) => key + 1)}
        onRowClick={(payment) => setOpenId(payment.id)}
        selectedId={openId}
        emptyTitle="No matching payments."
      />
      <Pagination
        pagination={list.pagination}
        page={page}
        onPage={setPage}
        summary={`${plural(total, "payment")} · ${rupees(list.totals?.amountPaise ?? 0)}${status ? ` ${(STATUS_LABELS[status] || status).toLowerCase()}` : " total"}`}
      />

      {openId && (
        <PaymentPanel
          paymentId={openId}
          go={go}
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

function PaymentPanel({ paymentId, go, onClose, onChanged }) {
  const [reloadKey, setReloadKey] = useState(0);
  const { data: payment, loading, error } = useAdminRecord(`/payments/${paymentId}`, reloadKey);
  const [check, setCheck] = useState({ busy: false, error: "" });

  const recheck = async () => {
    setCheck({ busy: true, error: "" });
    try {
      const result = await fetchPaymentStatus(payment.tiqrBookingUid);
      setCheck({ busy: false, error: "" });
      setReloadKey((key) => key + 1);
      onChanged(`TIQR reports this payment as ${STATUS_LABELS[result.status] || result.status}.`);
    } catch (err) {
      setCheck({ busy: false, error: err.message });
    }
  };

  const reg = payment?.registration;

  return (
    <SidePanel
      eyebrow="PAYMENT"
      title={reg?.teamName || "Payment"}
      onClose={onClose}
      footer={
        payment && (
          <>
            {reg?.team?.id && (
              <button className={styles.secondaryButton} onClick={() => go("teams", { open: reg.team.id })}>
                Open team
              </button>
            )}
            {reg && (
              <button className={styles.secondaryButton} onClick={() => go("registrations", { open: reg.id })}>
                Open registration
              </button>
            )}
            {payment.status !== "CONFIRMED" && (
              <button className={styles.primaryButton} onClick={recheck} disabled={check.busy}>
                {check.busy ? "Checking with TIQR…" : "Re-check with TIQR"}
              </button>
            )}
          </>
        )
      }
    >
      <PanelState loading={loading} error={error} />
      {check.error && <p className={styles.panelError}>{check.error}</p>}
      {payment && (
        <>
          <DetailRows
            rows={[
              { label: "Status", value: <StatusBadge value={payment.status} /> },
              { label: "Amount", value: `${rupees(payment.amountPaise)} ${payment.currency}` },
              { label: "Started", value: formatDate(payment.createdAt) },
              { label: "Paid on", value: payment.paidAt && formatDate(payment.paidAt) },
              { label: "Last updated", value: formatDate(payment.updatedAt) },
              {
                label: "TIQR booking UID",
                value: (
                  <span className={styles.inlineCopy}>
                    <code>{payment.tiqrBookingUid}</code>
                    <CopyButton text={payment.tiqrBookingUid} />
                  </span>
                ),
              },
              { label: "TIQR booking ID", value: payment.tiqrBookingId },
              { label: "Registration", value: reg && <StatusBadge value={reg.status} /> },
              { label: "College", value: reg?.collegeName },
              { label: "Signed-in leader", value: reg?.leader && `${reg.leader.name} (${reg.leader.email})` },
            ]}
          />
          {reg && <MemberList members={reg.members} teamName={reg.teamName} />}
          {payment.rawPayload && (
            <details className={styles.rawPayload}>
              <summary>Raw TIQR response</summary>
              <pre>{JSON.stringify(payment.rawPayload, null, 2)}</pre>
            </details>
          )}
        </>
      )}
    </SidePanel>
  );
}
