"use client";

import { useEffect, useState } from "react";
import styles from "./register.module.css";
import { WHATSAPP_GROUP_URL } from "../lib/community";

const SEEN_KEY_PREFIX = "tathack:whatsapp-invite-seen:";

// Whether the popup was already shown for this registration in this browser.
// Storage can be unavailable (private mode, blocked site data); the popup
// then simply shows again next time.
function wasSeen(registrationId) {
  try {
    return window.localStorage.getItem(SEEN_KEY_PREFIX + registrationId) === "1";
  } catch {
    return false;
  }
}

function markSeen(registrationId) {
  try {
    window.localStorage.setItem(SEEN_KEY_PREFIX + registrationId, "1");
  } catch {
    // Best-effort only.
  }
}

// Permanent invite on the paid team's dashboard.
export function WhatsAppInviteCard() {
  if (!WHATSAPP_GROUP_URL) return null;
  return (
    <div className={styles.inviteCard}>
      <p className={styles.eyebrow}>OFFICIAL WHATSAPP GROUP</p>
      <p className={styles.authCopy}>
        Event updates, schedules and announcements are shared in the TatHack
        &apos;26 WhatsApp group. Join it, and share this link with your
        teammates so they join too.
      </p>
      <a
        href={WHATSAPP_GROUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.primaryButton}
      >
        JOIN WHATSAPP GROUP <span>↗</span>
      </a>
    </div>
  );
}

// Shown once per registration, the first time the leader sees it as paid.
export function WhatsAppInvitePopup({ registrationId }) {
  const [open, setOpen] = useState(
    () => Boolean(WHATSAPP_GROUP_URL && registrationId) && !wasSeen(registrationId),
  );

  const close = () => {
    markSeen(registrationId);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") {
        markSeen(registrationId);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, registrationId]);

  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="whatsapp-invite-title">
      <div className={styles.modalBox}>
        <p className={styles.eyebrow}>PAYMENT CONFIRMED</p>
        <h2 id="whatsapp-invite-title" className={styles.modalTitle}>
          JOIN THE <span>WHATSAPP GROUP.</span>
        </h2>
        <p className={styles.authCopy}>
          All event updates, schedules and announcements for TatHack &apos;26
          are shared in the official WhatsApp group. Join now, and share the
          link with your teammates.
        </p>
        <div className={styles.modalActions}>
          <a
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryButton}
            onClick={close}
          >
            JOIN WHATSAPP GROUP <span>↗</span>
          </a>
          <button type="button" className={styles.secondaryButton} onClick={close}>
            MAYBE LATER
          </button>
        </div>
        <p className={styles.modalHint}>You can find this link on your dashboard anytime.</p>
      </div>
    </div>
  );
}
