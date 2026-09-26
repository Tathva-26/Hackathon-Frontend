"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import styles from "../admin.module.css";

// Confirmation for destructive actions. With `requireText`, the confirm button
// stays disabled until that exact text is typed.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  requireText,
  busy,
  error,
  onConfirm,
  onCancel,
}) {
  const [typed, setTyped] = useState("");
  const ready = !requireText || typed.trim() === requireText.trim();

  // Rendered into <body> so it sits above the side panel (see SidePanel).
  return createPortal(
    <div className={styles.modalBackdrop} onClick={busy ? undefined : onCancel}>
      <div className={styles.modal} role="alertdialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <span className={styles.eyebrow}>PLEASE CONFIRM</span>
        <h2>{title}</h2>
        <div className={styles.confirmMessage}>{message}</div>
        {requireText && (
          <label>
            <span>
              Type <code>{requireText}</code> to confirm
            </span>
            <input value={typed} onChange={(event) => setTyped(event.target.value)} autoFocus />
          </label>
        )}
        {error && <p className={styles.panelError}>{error}</p>}
        <div className={styles.modalActions}>
          <button className={styles.secondaryButton} onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className={styles.dangerSolid} onClick={onConfirm} disabled={!ready || busy}>
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
