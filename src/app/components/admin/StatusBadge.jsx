import styles from "../admin.module.css";
import { STATUS_HELP, STATUS_LABELS } from "./format";

export default function StatusBadge({ value }) {
  const status = value || "UNKNOWN";
  return (
    <span
      className={`${styles.status} ${styles[`s_${status.toLowerCase()}`] || ""}`}
      title={STATUS_HELP[status] || undefined}
    >
      {STATUS_LABELS[status] || status.replace(/_/g, " ")}
    </span>
  );
}
