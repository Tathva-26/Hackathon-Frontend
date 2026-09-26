"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import { useAdminRecord } from "./useAdminList";
import StatusBadge from "./StatusBadge";
import ContactLinks from "./ContactLinks";
import { STATUS_LABELS, displayPhone, formatDate, isUnpaid, rupees } from "./format";

// Help desk / check-in: who is this person and is their team paid?
export default function LookupTab({ params, go }) {
  const [input, setInput] = useState(params.q || "");
  const [query, setQuery] = useState(params.q || "");
  const { data, loading, error } = useAdminRecord(query ? `/lookup?q=${encodeURIComponent(query)}` : null);

  const found = data && data.teams.length + data.registrations.length + data.users.length > 0;

  return (
    <div className={styles.resource}>
      <form
        className={styles.lookupForm}
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(input.trim());
        }}
      >
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Email, phone number or name"
          aria-label="Find a person"
          autoFocus
        />
        <button type="submit" className={styles.primaryButton} disabled={input.trim().length < 3}>
          Find
        </button>
      </form>
      <p className={styles.tabHint}>
        Find anyone by email, phone (with or without +91) or name, and see which team they are in and whether it has paid.
      </p>

      {loading && <p className={styles.panelNote}>Searching…</p>}
      {error && <p className={styles.panelError}>{error.message}</p>}
      {data && !found && (
        <div className={styles.lookupEmpty}>
          <strong>No one found for &quot;{query}&quot;.</strong>
          <span>They are not in any team or registration, and have no account.</span>
        </div>
      )}

      {data?.teams.length > 0 && (
        <section className={styles.lookupSection}>
          <span className={styles.eyebrow}>IN A PAID TEAM ({data.teams.length})</span>
          {data.teams.map(({ member, team }) => (
            <article key={member.id} className={`${styles.lookupCard} ${styles.lookupPaid}`}>
              <div className={styles.lookupVerdict}>
                <StatusBadge value="PAID" />
                <span>Registered and paid</span>
              </div>
              <PersonLine member={member} />
              <p className={styles.lookupTeam}>
                {member.isLeader ? "Leader" : "Member"} of <b>{team.teamName}</b> · {team.collegeName} · {team.memberCount} members ·
                paid {rupees(team.amountPaise)} on {formatDate(team.paidAt)}
              </p>
              <ContactLinks phone={member.phone} email={member.email} name={member.name} teamName={team.teamName} />
              <button className={styles.linkButton} onClick={() => go("teams", { open: team.id })}>
                Open team →
              </button>
            </article>
          ))}
        </section>
      )}

      {data?.registrations.length > 0 && (
        <section className={styles.lookupSection}>
          <span className={styles.eyebrow}>IN A REGISTRATION THAT IS NOT PAID ({data.registrations.length})</span>
          {data.registrations.map(({ member, registration }) => (
            <article key={member.id} className={styles.lookupCard}>
              <div className={styles.lookupVerdict}>
                <StatusBadge value={registration.status} />
                <span>{isUnpaid(registration.status) ? `Not paid yet · ${rupees(registration.amountPaise)} due` : STATUS_LABELS[registration.status]}</span>
              </div>
              <PersonLine member={member} />
              <p className={styles.lookupTeam}>
                {member.isLeader ? "Leader" : "Member"} of <b>{registration.teamName}</b> · {registration.collegeName} ·{" "}
                {registration.memberCount} members · registered {formatDate(registration.createdAt)}
              </p>
              <ContactLinks
                phone={member.phone}
                email={member.email}
                name={member.name}
                teamName={registration.teamName}
                amount={rupees(registration.amountPaise)}
                kind={isUnpaid(registration.status) ? "reminder" : "general"}
              />
              <button className={styles.linkButton} onClick={() => go("registrations", { open: registration.id })}>
                Open registration →
              </button>
            </article>
          ))}
        </section>
      )}

      {data?.users.length > 0 && (
        <section className={styles.lookupSection}>
          <span className={styles.eyebrow}>ACCOUNTS ({data.users.length})</span>
          {data.users.map((account) => (
            <article key={account.id} className={styles.lookupCard}>
              <p className={styles.lookupTeam}>
                <b>{account.name}</b> · {account.email} {account.role === "ADMIN" && <StatusBadge value="ADMIN" />}
              </p>
              <p className={styles.panelNote}>Signed in first on {formatDate(account.createdAt)}</p>
              <button className={styles.linkButton} onClick={() => go("users", { search: account.email })}>
                Open in Users →
              </button>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function PersonLine({ member }) {
  return (
    <p className={styles.lookupPerson}>
      <strong>{member.name}</strong>
      <span>{member.email}</span>
      <span>{displayPhone(member.phone)}</span>
    </p>
  );
}
