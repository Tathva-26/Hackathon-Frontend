"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import { useAdminList, useDebounced } from "./useAdminList";
import DataTable from "./DataTable";
import Pagination from "./Pagination";
import StatusBadge from "./StatusBadge";
import { STATUS_LABELS, formatDate, plural, timeAgo } from "./format";

const PAGE_SIZE = 50;

function involvementText(involvement) {
  switch (involvement.type) {
    case "LEADER_PAID":
      return { text: `Leads ${involvement.teamName}`, note: "Paid team", tone: "good" };
    case "LEADER_UNPAID":
      return { text: `Leads ${involvement.teamName}`, note: STATUS_LABELS[involvement.status], tone: "warn" };
    case "MEMBER_PAID":
      return { text: `Member of ${involvement.teamName}`, note: "Paid team", tone: "good" };
    case "MEMBER_UNPAID":
      return { text: `Member of ${involvement.teamName}`, note: STATUS_LABELS[involvement.status], tone: "warn" };
    default:
      return { text: "Not in any team", note: "Signed in only", tone: "muted" };
  }
}

export default function UsersTab({ params, go }) {
  const [search, setSearch] = useState(params.search || "");
  const [role, setRole] = useState(params.role || "");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const list = useAdminList(
    "users",
    { search: useDebounced(search.trim()), role, page, limit: PAGE_SIZE },
    reloadKey,
  );

  const openInvolvement = (account) => {
    const { involvement } = account;
    if (involvement.teamId) go("teams", { open: involvement.teamId });
    else if (involvement.registrationId) go("registrations", { open: involvement.registrationId });
  };

  const columns = [
    {
      key: "name",
      header: "Account",
      render: (account) => (
        <>
          <strong>{account.name}</strong>
          <small>{account.email}</small>
        </>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (account) => (account.role === "ADMIN" ? <StatusBadge value="ADMIN" /> : <span className={styles.muted}>Participant</span>),
    },
    {
      key: "team",
      header: "Team",
      render: (account) => {
        const info = involvementText(account.involvement);
        return (
          <>
            <strong className={styles[`tone_${info.tone}`]}>{info.text}</strong>
            <small>{info.note}</small>
          </>
        );
      },
    },
    {
      key: "joined",
      header: "First signed in",
      render: (account) => (
        <>
          <span>{timeAgo(account.createdAt)}</span>
          <small>{formatDate(account.createdAt)}</small>
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Name or email"
            aria-label="Search accounts"
          />
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by role"
          >
            <option value="">All roles</option>
            <option value="LEADER">Participants</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>
      <p className={styles.tabHint}>
        Everyone who has signed in with Google. Members added to a team do not need an account, so this is not the participant list;
        use Teams for that. Click a row to open that person&apos;s team.
      </p>

      <DataTable
        columns={columns}
        rows={list.data}
        loading={list.loading}
        error={list.error}
        onRetry={() => setReloadKey((key) => key + 1)}
        onRowClick={(account) => openInvolvement(account)}
        emptyTitle="No matching accounts."
      />
      <Pagination pagination={list.pagination} page={page} onPage={setPage} summary={plural(total, "account")} />
    </div>
  );
}
