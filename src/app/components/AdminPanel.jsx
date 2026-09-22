"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { adminRequest, listFrom } from "../lib/adminApi";
import styles from "./admin.module.css";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "teams", label: "Teams" },
  { id: "payments", label: "Payments" },
  { id: "registrations", label: "Registrations" },
  { id: "announcements", label: "Announcements" },
];

const statusOptions = [
  "DRAFT",
  "PREBOOKED",
  "PAYMENT_PENDING",
  "PAYMENT_FAILED",
  "PAID",
  "EXPIRED",
  "CANCELLED",
  "REMOVED",
];
const paymentStatuses = [
  "CREATED",
  "VERIFIED",
  "AUTHORIZED",
  "CAPTURED",
  "FAILED",
  "REFUNDED",
];

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function money(value) {
  if (value === null || value === undefined || value === "") return "-";
  return `Rs. ${Number(value).toLocaleString("en-IN")}`;
}

function getName(item) {
  return (
    item?.teamName ||
    item?.name ||
    item?.leader?.name ||
    item?.user?.name ||
    "Unnamed"
  );
}

export default function AdminPanel() {
  const { user, token, status: authStatus, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    college: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [announcement, setAnnouncement] = useState(null);
  const [notice, setNotice] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const title = tabs.find((tab) => tab.id === activeTab)?.label || "Overview";

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: "100",
    });
    Object.entries(filters).forEach(
      ([key, value]) => value && params.set(key, value),
    );
    return params.toString();
  }, [filters, pagination.page]);

  useEffect(() => {
    if (!isAdmin || activeTab === "overview" || !token) return;
    let cancelled = false;
    startTransition(() => setLoading(true));
    const resource =
      activeTab === "announcements" ? "announcements" : activeTab;
    adminRequest(`/${resource}?${query}`, {}, token)
      .then((payload) => {
        if (cancelled) return;
        const metadata = payload?.pagination || payload?.meta || payload || {};
        const total =
          metadata.total ?? metadata.totalItems ?? metadata.totalCount;
        const limit = metadata.limit || 100;
        const explicitTotalPages = metadata.totalPages || metadata.pages;
        setItems(listFrom(payload));
        setPagination((current) => ({
          ...current,
          ...(payload?.pagination || payload?.meta || {}),
          total: total ?? listFrom(payload).length,
          totalPages:
            explicitTotalPages || (total ? Math.ceil(total / limit) : 1),
        }));
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeTab, isAdmin, query, token]);

  const runAction = async (action, successMessage) => {
    setError(null);
    try {
      await action();
      setNotice(successMessage);
      setSelected(null);
      setAnnouncement(null);
      const resource =
        activeTab === "announcements" ? "announcements" : activeTab;
      if (activeTab !== "overview") {
        const payload = await adminRequest(`/${resource}?${query}`, {}, token);
        setItems(listFrom(payload));
      }
    } catch (requestError) {
      setError(requestError);
    }
  };

  if (authStatus === "loading")
    return <main className={styles.centerState}>Loading admin session...</main>;
  if (authStatus !== "authenticated")
    return (
      <main className={styles.centerState}>
        <div>
          <span className={styles.eyebrow}>TatHack &apos;26</span>
          <h1>Admin access required</h1>
          <p>Sign in with an authorized account to continue.</p>
        </div>
      </main>
    );
  if (!isAdmin)
    return (
      <main className={styles.centerState}>
        <div>
          <span className={styles.eyebrow}>403 / FORBIDDEN</span>
          <h1>This console is restricted.</h1>
          <p>Your account is signed in, but its database role is not ADMIN.</p>
          <button className={styles.secondaryButton} onClick={logout}>
            Sign out
          </button>
        </div>
      </main>
    );

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
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? styles.activeTab : ""}
              onClick={() => {
                setActiveTab(tab.id);
                setError(null);
              }}
            >
              <span>
                {tab.id === "overview"
                  ? "01"
                  : tab.id === "teams"
                    ? "02"
                    : tab.id === "payments"
                      ? "03"
                      : tab.id === "registrations"
                        ? "04"
                        : "05"}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFoot}>
          <div className={styles.userBubble}>
            {user?.name?.charAt(0) || "A"}
          </div>
          <div>
            <strong>{user?.name || "Admin"}</strong>
            <small>{user?.email}</small>
          </div>
          <button
            className={styles.logout}
            onClick={logout}
            aria-label="Sign out"
          >
            x
          </button>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.eyebrow}>CONTROL ROOM / 2026</span>
            <h1>{title}</h1>
          </div>
          <div className={styles.live}>
            <i /> API CONNECTED
          </div>
        </header>
        {notice && (
          <div className={styles.notice}>
            {notice}
            <button onClick={() => setNotice("")}>x</button>
          </div>
        )}
        {error && (
          <div className={styles.error}>
            <strong>
              {error.status === 401
                ? "401 / SIGN IN AGAIN"
                : error.status === 403
                  ? "403 / FORBIDDEN"
                  : "REQUEST FAILED"}
            </strong>
            <span>{error.message}</span>
            <button onClick={() => setError(null)}>x</button>
          </div>
        )}

        {activeTab === "overview" ? (
          <Overview onNavigate={setActiveTab} />
        ) : (
          <ResourceView
            activeTab={activeTab}
            items={items}
            loading={loading}
            filters={filters}
            setFilters={setFilters}
            pagination={pagination}
            setPagination={setPagination}
            onSelect={setSelected}
            onCreate={() => setAnnouncement({})}
          />
        )}
      </section>

      {selected && (
        <DetailModal
          item={selected}
          type={activeTab}
          token={token}
          onClose={() => setSelected(null)}
          onSave={(data) =>
            runAction(
              () =>
                adminRequest(
                  `/teams/${selected.id || selected.teamId}`,
                  { method: "PATCH", body: JSON.stringify(data) },
                  token,
                ),
              "Team updated successfully.",
            )
          }
          onDelete={() =>
            runAction(
              () =>
                adminRequest(
                  `/teams/${selected.id || selected.teamId}`,
                  { method: "DELETE" },
                  token,
                ),
              "Team removed successfully.",
            )
          }
        />
      )}
      {announcement && (
        <AnnouncementModal
          announcement={announcement}
          token={token}
          onClose={() => setAnnouncement(null)}
          onSave={(data) =>
            runAction(
              () =>
                adminRequest(
                  announcement.id
                    ? `/announcements/${announcement.id}`
                    : "/announcements",
                  {
                    method: announcement.id ? "PATCH" : "POST",
                    body: JSON.stringify(data),
                  },
                  token,
                ),
              announcement.id
                ? "Announcement updated."
                : "Announcement published.",
            )
          }
        />
      )}
    </main>
  );
}

function Overview({ onNavigate }) {
  return (
    <div className={styles.overview}>
      <div className={styles.heroPanel}>
        <div>
          <span className={styles.eyebrow}>TATHVA NIT CALICUT</span>
          <h2>
            Make the call.
            <br />
            <em>Move the event.</em>
          </h2>
          <p>
            Live operations for registrations, teams, payments and event
            communication.
          </p>
        </div>
        <div className={styles.heroStamp}>
          26
          <br />
          <small>ADMIN</small>
        </div>
      </div>
      <div className={styles.metricGrid}>
        <Metric
          label="Team pipeline"
          value="View teams"
          action={() => onNavigate("teams")}
          accent="lime"
        />
        <Metric
          label="Payment ledger"
          value="View payments"
          action={() => onNavigate("payments")}
          accent="coral"
        />
        <Metric
          label="Registration drafts"
          value="View queue"
          action={() => onNavigate("registrations")}
          accent="blue"
        />
        <Metric
          label="Broadcast center"
          value="Manage news"
          action={() => onNavigate("announcements")}
          accent="yellow"
        />
      </div>
      <div className={styles.quickPanel}>
        <div>
          <span className={styles.eyebrow}>OPERATOR NOTE</span>
          <h3>Keep the queue clean.</h3>
          <p>
            Use the resource views to filter records, open complete details, and
            resolve changes without leaving the console.
          </p>
        </div>
        <div className={styles.statusList}>
          <span>
            <i className={styles.dotLime} />
            Database role enforced
          </span>
          <span>
            <i className={styles.dotBlue} />
            Pagination enabled
          </span>
          <span>
            <i className={styles.dotCoral} />
            Webhook-safe removal
          </span>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, action, accent }) {
  return (
    <button className={`${styles.metric} ${styles[accent]}`} onClick={action}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>Open view -&gt;</small>
    </button>
  );
}

function ResourceView({
  activeTab,
  items,
  loading,
  filters,
  setFilters,
  pagination,
  setPagination,
  onSelect,
  onCreate,
}) {
  const isAnnouncement = activeTab === "announcements";
  const isPayments = activeTab === "payments";
  const isRegistrations = activeTab === "registrations";
  const changeFilter = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };
  return (
    <div className={styles.resource}>
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          {!isRegistrations && (
            <input
              value={filters.search}
              onChange={(event) => changeFilter("search", event.target.value)}
              placeholder={
                isPayments ? "Search order or payment ID" : "Search records"
              }
            />
          )}
          {activeTab === "teams" && (
            <input
              value={filters.college}
              onChange={(event) => changeFilter("college", event.target.value)}
              placeholder="Filter college"
            />
          )}
          <select
            value={filters.status}
            onChange={(event) => changeFilter("status", event.target.value)}
          >
            <option value="">All statuses</option>
            {(isPayments ? paymentStatuses : statusOptions).map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        {isAnnouncement && (
          <button className={styles.primaryButton} onClick={onCreate}>
            + New announcement
          </button>
        )}
      </div>
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.tableState}>Loading live records...</div>
        ) : items.length === 0 ? (
          <div className={styles.tableState}>
            <strong>No records found.</strong>
            <span>Adjust your filters or wait for the API to return data.</span>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                {isAnnouncement ? (
                  <>
                    <th>Announcement</th>
                    <th>Published</th>
                    <th>Created</th>
                    <th />
                  </>
                ) : isPayments ? (
                  <>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Created</th>
                  </>
                ) : (
                  <>
                    <th>{activeTab === "teams" ? "Team" : "Leader"}</th>
                    <th>{activeTab === "teams" ? "College" : "Status"}</th>
                    <th>
                      {activeTab === "teams" ? "Registration" : "Members"}
                    </th>
                    <th>Created</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id || item.teamId || item.paymentId || index}
                  onClick={() => onSelect(item)}
                >
                  {isAnnouncement ? (
                    <>
                      <td>
                        <strong>{item.title}</strong>
                        <small>{item.content}</small>
                      </td>
                      <td>
                        <Status
                          value={item.isPublished ? "PUBLISHED" : "DRAFT"}
                        />
                      </td>
                      <td>{formatDate(item.createdAt)}</td>
                      <td className={styles.rowArrow}>-&gt;</td>
                    </>
                  ) : isPayments ? (
                    <>
                      <td>
                        <strong>
                          {item.razorpayOrderId ||
                            item.orderId ||
                            item.razorpayPaymentId ||
                            item.paymentId ||
                            "Payment"}
                        </strong>
                        <small>
                          {item.team?.teamName ||
                            item.registration?.teamName ||
                            "No team attached"}
                        </small>
                      </td>
                      <td>
                        <Status value={item.status} />
                      </td>
                      <td>{money(item.amount)}</td>
                      <td>{formatDate(item.createdAt)}</td>
                    </>
                  ) : (
                    <>
                      <td>
                        <strong>{getName(item)}</strong>
                        <small>
                          {item.leader?.email || item.email || "No email"}
                        </small>
                      </td>
                      <td>
                        {activeTab === "teams" ? (
                          item.collegeName || item.college || "-"
                        ) : (
                          <Status
                            value={item.status || item.registration?.status}
                          />
                        )}
                      </td>
                      <td>
                        {activeTab === "teams"
                          ? `${item.memberCount ?? item.members?.length ?? 0} members`
                          : `${item.members?.length ?? item.memberCount ?? 0} members`}
                      </td>
                      <td>{formatDate(item.createdAt)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className={styles.pagination}>
        <span>{pagination.total || items.length} records</span>
        <div>
          <button
            disabled={pagination.page <= 1}
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
          >
            &lt;
          </button>
          <strong>
            Page {pagination.page} of {pagination.totalPages || 1}
          </strong>
          <button
            disabled={pagination.page >= (pagination.totalPages || 1)}
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page + 1 })
            }
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

function Status({ value }) {
  return (
    <span
      className={`${styles.status} ${styles[String(value || "UNKNOWN").toLowerCase()] || ""}`}
    >
      {value || "UNKNOWN"}
    </span>
  );
}

function DetailModal({ item, type, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    teamName: item.teamName || "",
    collegeName: item.collegeName || "",
  });
  if (type !== "teams")
    return (
      <div className={styles.modalBackdrop} onClick={onClose}>
        <div
          className={styles.modal}
          onClick={(event) => event.stopPropagation()}
        >
          <button className={styles.modalClose} onClick={onClose}>
            x
          </button>
          <span className={styles.eyebrow}>DETAIL VIEW</span>
          <h2>{getName(item)}</h2>
          <p>
            {item.content ||
              item.leader?.email ||
              item.email ||
              "No additional detail available."}
          </p>
          <div className={styles.detailRows}>
            <span>
              Status{" "}
              <strong>
                {item.status || (item.isPublished ? "PUBLISHED" : "DRAFT")}
              </strong>
            </span>
            <span>
              Created <strong>{formatDate(item.createdAt)}</strong>
            </span>
          </div>
        </div>
      </div>
    );
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <button className={styles.modalClose} onClick={onClose}>
          x
        </button>
        <span className={styles.eyebrow}>EDIT TEAM</span>
        <h2>{getName(item)}</h2>
        <label>
          Team name
          <input
            value={form.teamName}
            onChange={(event) =>
              setForm({ ...form, teamName: event.target.value })
            }
          />
        </label>
        <label>
          College
          <input
            value={form.collegeName}
            onChange={(event) =>
              setForm({ ...form, collegeName: event.target.value })
            }
          />
        </label>
        <div className={styles.memberList}>
          {(item.members || []).map((member) => (
            <span key={member.id}>
              {member.name}
              <small>{member.email}</small>
            </span>
          ))}
        </div>
        <div className={styles.modalActions}>
          <button className={styles.dangerButton} onClick={onDelete}>
            Delete team
          </button>
          <button className={styles.primaryButton} onClick={() => onSave(form)}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function AnnouncementModal({ announcement, onClose, onSave }) {
  const [form, setForm] = useState({
    title: announcement.title || "",
    content: announcement.content || "",
    isPublished: announcement.isPublished ?? true,
  });
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <button className={styles.modalClose} onClick={onClose}>
          x
        </button>
        <span className={styles.eyebrow}>
          {announcement.id ? "EDIT ANNOUNCEMENT" : "NEW ANNOUNCEMENT"}
        </span>
        <h2>Broadcast to the event.</h2>
        <label>
          Headline
          <input
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            placeholder="Registration extended"
          />
        </label>
        <label>
          Message
          <textarea
            value={form.content}
            onChange={(event) =>
              setForm({ ...form, content: event.target.value })
            }
            placeholder="Write the update..."
            rows={5}
          />
        </label>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(event) =>
              setForm({ ...form, isPublished: event.target.checked })
            }
          />{" "}
          Publish immediately
        </label>
        <div className={styles.modalActions}>
          <button className={styles.secondaryButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.primaryButton} onClick={() => onSave(form)}>
            Save announcement
          </button>
        </div>
      </div>
    </div>
  );
}
