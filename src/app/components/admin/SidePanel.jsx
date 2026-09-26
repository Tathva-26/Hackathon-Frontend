"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "../admin.module.css";

// Detail drawer on the right. Escape or a click on the backdrop closes it.
// Rendered into <body>: the console's views animate with a transform, and a
// transformed ancestor would trap position: fixed inside that view.
export default function SidePanel(props) {
  return createPortal(<SidePanelContent {...props} />, document.body);
}

function SidePanelContent({ eyebrow, title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.panelBackdrop} onClick={onClose}>
      <aside
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : eyebrow}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.panelHeader}>
          <div>
            {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
            <h2>{title}</h2>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className={styles.panelBody}>{children}</div>
        {footer && <footer className={styles.panelFooter}>{footer}</footer>}
      </aside>
    </div>
  );
}

// Label/value rows inside a panel.
export function DetailRows({ rows }) {
  return (
    <dl className={styles.detailList}>
      {rows
        .filter((row) => row && row.value !== undefined && row.value !== null && row.value !== "")
        .map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
    </dl>
  );
}

export function PanelState({ loading, error }) {
  if (loading) return <p className={styles.panelNote}>Loading…</p>;
  if (error) return <p className={styles.panelError}>{error.message}</p>;
  return null;
}
