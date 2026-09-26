"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import { adminDownload, adminRequest, buildQuery } from "../../lib/adminApi";
import { useAdminList, useAdminRecord, useDebounced } from "./useAdminList";
import DataTable from "./DataTable";
import Pagination from "./Pagination";
import SidePanel, { DetailRows, PanelState } from "./SidePanel";
import ConfirmDialog from "./ConfirmDialog";
import MemberList from "./MemberList";
import ContactLinks, { CopyButton } from "./ContactLinks";
import { displayPhone, formatDate, plural, rupees, timeAgo } from "./format";

const PAGE_SIZE = 25;

export default function TeamsTab({ params, go, notify, reportError }) {
  const [search, setSearch] = useState(params.search || "");
  const [college, setCollege] = useState(params.college || "");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(params.open || null);
  const [reloadKey, setReloadKey] = useState(0);
  const [exporting, setExporting] = useState(false);

  const filters = { search: useDebounced(search.trim()), college: useDebounced(college.trim()) };
  const list = useAdminList("teams", { ...filters, page, limit: PAGE_SIZE }, reloadKey);

  const setFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      await adminDownload(`/export/teams.csv?${buildQuery(filters)}`, "tathack-teams.csv");
    } catch (error) {
      reportError(error);
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    {
      key: "team",
      header: "Team",
      render: (team) => (
        <>
          <strong>{team.teamName}</strong>
          <small>{team.collegeName}</small>
        </>
      ),
    },
    {
      key: "leader",
      header: "Leader",
      render: (team) => (
        <>
          <strong>{team.leader?.name || "–"}</strong>
          <small>{team.leader?.email}</small>
        </>
      ),
    },
    {
      key: "phone",
      header: "Leader phone",
      render: (team) => (
        <>
          <span className={styles.nowrap}>{displayPhone(team.leader?.phone)}</span>
          <ContactLinks phone={team.leader?.phone} name={team.leader?.name} teamName={team.teamName} compact />
        </>
      ),
    },
    { key: "members", header: "Size", render: (team) => plural(team.memberCount, "member") },
    {
      key: "paid",
      header: "Paid",
      render: (team) => (
        <>
          <strong>{rupees(team.amountPaise)}</strong>
          <small title={formatDate(team.paidAt)}>{timeAgo(team.paidAt)}</small>
        </>
      ),
    },
  ];

  return (
    <div className={styles.resource}>
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <input
            type="search"
            value={search}
            onChange={setFilter(setSearch)}
            placeholder="Team, member name, email or phone"
            aria-label="Search teams"
          />
          <input
            type="search"
            value={college}
            onChange={setFilter(setCollege)}
            placeholder="College"
            aria-label="Filter by college"
          />
        </div>
        <div className={styles.toolbarActions}>
          <button className={styles.primaryButton} onClick={exportCsv} disabled={exporting}>
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </div>
      <p className={styles.tabHint}>
        Paid, confirmed teams. Click a team to see every member&apos;s contact details, edit them, or remove the team.
      </p>

      <DataTable
        columns={columns}
        rows={list.data}
        loading={list.loading}
        error={list.error}
        onRetry={() => setReloadKey((key) => key + 1)}
        onRowClick={(team) => setOpenId(team.id)}
        selectedId={openId}
        emptyTitle={filters.search || filters.college ? "No matching teams." : "No paid teams yet."}
      />
      <Pagination pagination={list.pagination} page={page} onPage={setPage} />

      {openId && (
        <TeamPanel
          teamId={openId}
          go={go}
          onClose={() => setOpenId(null)}
          onChanged={(message, closed) => {
            notify(message);
            setReloadKey((key) => key + 1);
            if (closed) setOpenId(null);
          }}
          reportError={reportError}
        />
      )}
    </div>
  );
}

function TeamPanel({ teamId, go, onClose, onChanged, reportError }) {
  const [reloadKey, setReloadKey] = useState(0);
  const { data: team, loading, error } = useAdminRecord(`/teams/${teamId}`, reloadKey);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState({ busy: false, error: "" });

  const deleteTeam = async () => {
    setDeleting({ busy: true, error: "" });
    try {
      await adminRequest(`/teams/${teamId}`, { method: "DELETE" });
      setConfirmDelete(false);
      onChanged(`Team "${team.teamName}" was removed. Its members can now join other teams.`, true);
    } catch (err) {
      setDeleting({ busy: false, error: err.message });
    }
  };

  return (
    <SidePanel
      eyebrow="PAID TEAM"
      title={team?.teamName || "Team"}
      onClose={onClose}
      footer={
        team &&
        !editing && (
          <>
            <button className={styles.dangerButton} onClick={() => setConfirmDelete(true)}>
              Remove team
            </button>
            <button className={styles.primaryButton} onClick={() => setEditing(true)}>
              Edit details
            </button>
          </>
        )
      }
    >
      <PanelState loading={loading} error={error} />
      {team && !editing && (
        <>
          <DetailRows
            rows={[
              { label: "College", value: team.collegeName },
              { label: "Team size", value: plural(team.members.length, "member") },
              { label: "Amount paid", value: rupees(team.registration?.amountPaise) },
              { label: "Paid on", value: formatDate(team.registration?.payment?.paidAt || team.createdAt) },
              {
                label: "TIQR booking",
                value: team.registration?.payment?.tiqrBookingUid && (
                  <span className={styles.inlineCopy}>
                    <code>{team.registration.payment.tiqrBookingUid}</code>
                    <CopyButton text={team.registration.payment.tiqrBookingUid} />
                  </span>
                ),
              },
              { label: "Signed-in leader", value: team.leader && `${team.leader.name} (${team.leader.email})` },
            ]}
          />
          {team.registration?.id && (
            <button className={styles.linkButton} onClick={() => go("registrations", { open: team.registration.id })}>
              View registration history →
            </button>
          )}
          <MemberList members={team.members} teamName={team.teamName} />
        </>
      )}
      {team && editing && (
        <TeamEditForm
          team={team}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            setReloadKey((key) => key + 1);
            onChanged(`Team "${team.teamName}" updated.`);
          }}
          reportError={reportError}
        />
      )}
      {confirmDelete && team && (
        <ConfirmDialog
          title="Remove this team?"
          message={
            <>
              <p>
                <b>{team.teamName}</b> ({plural(team.members.length, "member")}, paid {rupees(team.registration?.amountPaise)}) will be
                deleted and its registration marked <b>Removed</b>.
              </p>
              <p>Its members will be free to join other teams. No refund is issued. This cannot be undone from the console.</p>
            </>
          }
          confirmLabel="Remove team"
          requireText={team.teamName}
          busy={deleting.busy}
          error={deleting.error}
          onConfirm={deleteTeam}
          onCancel={() => {
            setConfirmDelete(false);
            setDeleting({ busy: false, error: "" });
          }}
        />
      )}
    </SidePanel>
  );
}

function TeamEditForm({ team, onCancel, onSaved }) {
  const [form, setForm] = useState({
    teamName: team.teamName,
    collegeName: team.collegeName,
    members: team.members.map((m) => ({ id: m.id, name: m.name, email: m.email, phone: m.phone, isLeader: m.isLeader })),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateMember = (id, field, value) =>
    setForm((current) => ({
      ...current,
      members: current.members.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }));

  const save = async (event) => {
    event.preventDefault();
    const body = {};
    if (form.teamName.trim() !== team.teamName) body.teamName = form.teamName.trim();
    if (form.collegeName.trim() !== team.collegeName) body.collegeName = form.collegeName.trim();
    const members = form.members
      .map((m) => {
        const original = team.members.find((o) => o.id === m.id);
        const change = { id: m.id };
        ["name", "email", "phone"].forEach((field) => {
          if (m[field].trim() !== original[field]) change[field] = m[field].trim();
        });
        return change;
      })
      .filter((change) => Object.keys(change).length > 1);
    if (members.length) body.members = members;

    if (Object.keys(body).length === 0) {
      onCancel();
      return;
    }
    setSaving(true);
    setError("");
    try {
      await adminRequest(`/teams/${team.id}`, { method: "PATCH", body: JSON.stringify(body) });
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form className={styles.editForm} onSubmit={save}>
      <label>
        Team name
        <input value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} required minLength={2} maxLength={80} />
      </label>
      <label>
        College
        <input
          value={form.collegeName}
          onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
          required
          minLength={2}
          maxLength={120}
        />
      </label>
      {form.members.map((member, index) => (
        <fieldset key={member.id} className={styles.memberFieldset}>
          <legend>
            Member {index + 1} {member.isLeader && <em className={styles.leaderTag}>LEADER</em>}
          </legend>
          <input aria-label="Name" value={member.name} onChange={(e) => updateMember(member.id, "name", e.target.value)} required maxLength={80} />
          <input
            aria-label="Email"
            type="email"
            value={member.email}
            onChange={(e) => updateMember(member.id, "email", e.target.value)}
            required
          />
          <input aria-label="Phone" value={member.phone} onChange={(e) => updateMember(member.id, "phone", e.target.value)} required />
        </fieldset>
      ))}
      <p className={styles.panelNote}>
        Changing the leader&apos;s email here does not change which Google account manages the team.
      </p>
      {error && <p className={styles.panelError}>{error}</p>}
      <div className={styles.formActions}>
        <button type="button" className={styles.secondaryButton} onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className={styles.primaryButton} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
