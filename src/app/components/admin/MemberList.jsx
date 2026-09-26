import styles from "../admin.module.css";
import ContactLinks from "./ContactLinks";
import { displayPhone } from "./format";

// Team members with their contact details, leader first.
export default function MemberList({ members = [], teamName, amount, kind = "general" }) {
  if (members.length === 0) return null;
  return (
    <section className={styles.members}>
      <span className={styles.eyebrow}>MEMBERS ({members.length})</span>
      {members.map((member) => (
        <div key={member.id || member.email} className={styles.memberCard}>
          <div className={styles.memberHead}>
            <strong>{member.name || "Unnamed"}</strong>
            {member.isLeader && <em className={styles.leaderTag}>LEADER</em>}
          </div>
          <div className={styles.memberMeta}>
            <span>{member.email || "No email"}</span>
            <span>{displayPhone(member.phone)}</span>
          </div>
          <ContactLinks
            phone={member.phone}
            email={member.email}
            name={member.name}
            teamName={teamName}
            amount={amount}
            kind={kind}
          />
        </div>
      ))}
    </section>
  );
}
