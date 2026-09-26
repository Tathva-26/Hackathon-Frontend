"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import { dialNumber, whatsappNumber } from "./format";

// Pre-filled messages. "reminder" nudges an unpaid team to pay; "general" is a
// neutral opener for teams that have already paid.
export function contactMessage({ kind, name, teamName, amount }) {
  const firstName = (name || "there").split(" ")[0];
  const site = typeof window !== "undefined" ? window.location.origin : "";
  if (kind === "reminder") {
    return {
      subject: "Complete your TatHack '26 registration payment",
      body:
        `Hi ${firstName}, this is the TatHack '26 team. Your team "${teamName}" is registered, ` +
        `but the payment${amount ? ` of ${amount}` : ""} is still pending. ` +
        `Please complete it at ${site}/register to confirm your spot. Reply here if you need any help!`,
    };
  }
  return {
    subject: `TatHack '26 – team ${teamName}`,
    body: `Hi ${firstName}, this is the TatHack '26 team reaching out about your team "${teamName}".`,
  };
}

export function CopyButton({ text, label = "Copy", className }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className || styles.chip}
      onClick={async (event) => {
        event.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          window.prompt("Copy this:", text);
        }
      }}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}

// Call / WhatsApp / Email / Copy buttons for one person. `compact` shows only
// Call and WhatsApp (for table rows).
export default function ContactLinks({ phone, email, name, teamName, amount, kind = "general", compact }) {
  const message = contactMessage({ kind, name, teamName, amount });
  const stop = (event) => event.stopPropagation();

  return (
    <span className={styles.contactLinks}>
      {phone && (
        <>
          <a className={styles.chip} href={`tel:${dialNumber(phone)}`} onClick={stop}>
            Call
          </a>
          <a
            className={`${styles.chip} ${styles.chipWhatsapp}`}
            href={`https://wa.me/${whatsappNumber(phone)}?text=${encodeURIComponent(message.body)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={stop}
          >
            WhatsApp
          </a>
        </>
      )}
      {!compact && email && (
        <a
          className={styles.chip}
          href={`mailto:${email}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}`}
          onClick={stop}
        >
          Email
        </a>
      )}
      {!compact && phone && <CopyButton text={phone} label="Copy phone" />}
      {!compact && email && <CopyButton text={email} label="Copy email" />}
    </span>
  );
}
