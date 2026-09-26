"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import { adminRequest } from "../../lib/adminApi";
import { useAdminList } from "./useAdminList";
import DataTable from "./DataTable";
import SidePanel from "./SidePanel";
import ConfirmDialog from "./ConfirmDialog";
import StatusBadge from "./StatusBadge";
import { formatDate, plural } from "./format";

const TITLE_MAX = 100;
const CONTENT_MAX = 10000;

export default function AnnouncementsTab({ notify }) {
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [editing, setEditing] = useState(null); // null | {} (new) | announcement
  const list = useAdminList("announcements", {}, reloadKey);

  // The API returns every announcement at once, so filtering happens here.
  const needle = search.trim().toLowerCase();
  const rows = list.data.filter(
    (item) =>
      (!state || (state === "PUBLISHED" ? item.isPublished : !item.isPublished)) &&
      (!needle || item.title.toLowerCase().includes(needle) || item.content.toLowerCase().includes(needle)),
  );

  const columns = [
    {
      key: "title",
      header: "Announcement",
      render: (item) => (
        <>
          <strong>{item.title}</strong>
          <small>{item.content}</small>
        </>
      ),
    },
    { key: "status", header: "Status", render: (item) => <StatusBadge value={item.isPublished ? "PUBLISHED" : "DRAFT"} /> },
    { key: "author", header: "Author", render: (item) => item.author?.name || "–" },
    {
      key: "date",
      header: "Published / created",
      render: (item) => (
        <>
          <span>{formatDate(item.publishedAt || item.createdAt)}</span>
          <small>{item.publishedAt ? "published" : "created"}</small>
        </>
      ),
    },
  ];

  const done = (message) => {
    setEditing(null);
    setReloadKey((key) => key + 1);
    notify(message);
  };

  return (
    <div className={styles.resource}>
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements"
            aria-label="Search announcements"
          />
          <select value={state} onChange={(e) => setState(e.target.value)} aria-label="Filter by status">
            <option value="">All</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Drafts</option>
          </select>
        </div>
        <div className={styles.toolbarActions}>
          <button className={styles.primaryButton} onClick={() => setEditing({})}>
            + New announcement
          </button>
        </div>
      </div>
      <p className={styles.tabHint}>
        Published announcements are served by the public announcements API. Click one to edit, unpublish or delete it.
      </p>

      <DataTable
        columns={columns}
        rows={rows}
        loading={list.loading}
        error={list.error}
        onRetry={() => setReloadKey((key) => key + 1)}
        onRowClick={(item) => setEditing(item)}
        selectedId={editing?.id}
        emptyTitle={list.data.length ? "No matching announcements." : "No announcements yet."}
      />
      <div className={styles.pagination}>
        <span>{plural(rows.length, "announcement")}</span>
      </div>

      {editing && <AnnouncementEditor announcement={editing} onClose={() => setEditing(null)} onDone={done} />}
    </div>
  );
}

function AnnouncementEditor({ announcement, onClose, onDone }) {
  const isNew = !announcement.id;
  const [form, setForm] = useState({
    title: announcement.title || "",
    content: announcement.content || "",
    isPublished: announcement.isPublished ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminRequest(isNew ? "/announcements" : `/announcements/${announcement.id}`, {
        method: isNew ? "POST" : "PATCH",
        body: JSON.stringify({ title: form.title.trim(), content: form.content.trim(), isPublished: form.isPublished }),
      });
      onDone(isNew ? (form.isPublished ? "Announcement published." : "Draft saved.") : "Announcement updated.");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await adminRequest(`/announcements/${announcement.id}`, { method: "DELETE" });
      onDone("Announcement deleted.");
    } catch (err) {
      setError(err.message);
      setSaving(false);
      setConfirmDelete(false);
    }
  };

  return (
    <SidePanel eyebrow={isNew ? "NEW ANNOUNCEMENT" : "EDIT ANNOUNCEMENT"} title={isNew ? "Broadcast an update" : announcement.title} onClose={onClose}>
      <form className={styles.editForm} onSubmit={save}>
        <label>
          Headline
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={TITLE_MAX}
            placeholder="Registration extended"
            required
          />
          <small className={styles.counter}>
            {form.title.length}/{TITLE_MAX}
          </small>
        </label>
        <label>
          Message
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            maxLength={CONTENT_MAX}
            rows={8}
            placeholder="Write the update…"
            required
          />
          <small className={styles.counter}>
            {form.content.length}/{CONTENT_MAX}
          </small>
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
          {isNew ? "Publish immediately" : "Published"}
        </label>

        {(form.title || form.content) && (
          <div className={styles.preview}>
            <span className={styles.eyebrow}>PREVIEW</span>
            <h3>{form.title || "Headline"}</h3>
            <p>{form.content || "Message"}</p>
          </div>
        )}

        {!isNew && (
          <p className={styles.panelNote}>
            Created {formatDate(announcement.createdAt)}
            {announcement.author?.name && ` by ${announcement.author.name}`}
            {announcement.publishedAt && ` · published ${formatDate(announcement.publishedAt)}`}
          </p>
        )}
        {error && <p className={styles.panelError}>{error}</p>}
        <div className={styles.formActions}>
          {!isNew && (
            <button type="button" className={styles.dangerButton} onClick={() => setConfirmDelete(true)} disabled={saving}>
              Delete
            </button>
          )}
          <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className={styles.primaryButton} disabled={saving || !form.title.trim() || !form.content.trim()}>
            {saving ? "Saving…" : isNew ? (form.isPublished ? "Publish" : "Save draft") : "Save changes"}
          </button>
        </div>
      </form>
      {confirmDelete && (
        <ConfirmDialog
          title="Delete this announcement?"
          message={<p>&quot;{announcement.title}&quot; will be removed for everyone. This cannot be undone.</p>}
          confirmLabel="Delete"
          busy={saving}
          onConfirm={remove}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </SidePanel>
  );
}
