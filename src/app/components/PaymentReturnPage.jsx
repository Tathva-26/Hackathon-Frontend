"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./register.module.css";
import { useAuth } from "./AuthProvider";
import { fetchMyRegistration, fetchPaymentStatus } from "../lib/auth";
import { WhatsAppInvitePopup } from "./WhatsAppInvite";

// TIQR has no webhook (see hackathon-backend/PAYMENT_FLOW.md); this page is
// where the buyer lands after TIQR checkout (callback_url), and polling
// GET /api/v1/payments/status/:bookingUid from here is what actually
// confirms the payment, not something that happens automatically server-side.
const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 20; // ~50s

export default function PaymentReturnPage() {
  const { user: currentUser, token: authToken, status: authStatus } = useAuth();
  // loading | no_registration | already_paid | polling | confirmed | failed | timed_out | error
  const [view, setView] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [registrationId, setRegistrationId] = useState(null);
  const attemptsRef = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (authStatus !== "authenticated" || !currentUser) return undefined;
    cancelledRef.current = false;
    attemptsRef.current = 0;

    let pollTimer = null;

    const poll = async (bookingUid) => {
      if (cancelledRef.current) return;
      attemptsRef.current += 1;
      try {
        const result = await fetchPaymentStatus(bookingUid);
        if (cancelledRef.current) return;
        if (result.status === "CONFIRMED") {
          setView("confirmed");
          return;
        }
        if (result.status === "FAILED") {
          setView("failed");
          return;
        }
      } catch (err) {
        if (cancelledRef.current) return;
        // A transient reconcile failure shouldn't give up immediately - keep
        // polling until the attempt budget runs out.
        setErrorMessage(err.message || "");
      }
      if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
        setView("timed_out");
        return;
      }
      pollTimer = setTimeout(() => poll(bookingUid), POLL_INTERVAL_MS);
    };

    fetchMyRegistration(authToken)
      .then((data) => {
        if (cancelledRef.current) return;
        if (!data.registered || !data.status) {
          setView("no_registration");
          return;
        }
        setRegistrationId(data.registrationId || null);
        if (data.status === "PAID") {
          setView("already_paid");
          return;
        }
        const bookingUid = data.payment?.tiqrBookingUid;
        if (data.status !== "PAYMENT_PENDING" || !bookingUid) {
          // No payment in flight to confirm (e.g. they navigated here directly).
          setView("no_registration");
          return;
        }
        setView("polling");
        poll(bookingUid);
      })
      .catch(() => {
        if (cancelledRef.current) return;
        setView("error");
      });

    return () => {
      cancelledRef.current = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [authStatus, currentUser, authToken]);

  if (authStatus === "loading" || view === "loading") {
    return (
      <main className={styles.page}>
        <div className={styles.grid} />
        <p className={styles.loading}>CHECKING PAYMENT...</p>
      </main>
    );
  }

  if (authStatus === "unauthenticated" || !currentUser) {
    return (
      <main className={styles.page}>
        <div className={styles.grid} />
        <section className={styles.authPanel}>
          <p className={styles.eyebrow}>TATHVA PRESENTS</p>
          <h1 className={styles.authTitle}>
            SIGN IN
            <br />
            <span>TO CONTINUE.</span>
          </h1>
          <p className={styles.authCopy}>
            Sign back in to see your payment status.
          </p>
          <Link href="/register" className={styles.primaryButton}>
            GO TO REGISTRATION <span>↗</span>
          </Link>
        </section>
      </main>
    );
  }

  const panels = {
    polling: {
      title: (
        <>
          CONFIRMING
          <br />
          <span>PAYMENT...</span>
        </>
      ),
      copy: "Hang tight — we're checking with TIQR that your payment went through. This usually takes a few seconds.",
      cta: null,
    },
    confirmed: {
      title: (
        <>
          PAYMENT
          <br />
          <span>CONFIRMED.</span>
        </>
      ),
      copy: "You're all set for TatHack '26. See you at the event!",
      cta: { href: "/register", label: "GO TO DASHBOARD" },
    },
    already_paid: {
      title: (
        <>
          ALREADY
          <br />
          <span>PAID.</span>
        </>
      ),
      copy: "Your team is already confirmed and paid.",
      cta: { href: "/register", label: "GO TO DASHBOARD" },
    },
    failed: {
      title: (
        <>
          PAYMENT
          <br />
          <span>FAILED.</span>
        </>
      ),
      copy: "TIQR reported this payment as failed or cancelled. You can try again from your dashboard.",
      cta: { href: "/register", label: "BACK TO DASHBOARD" },
    },
    timed_out: {
      title: (
        <>
          STILL
          <br />
          <span>PROCESSING.</span>
        </>
      ),
      copy: "This is taking longer than usual. If you completed the payment, check your dashboard in a minute — it will refresh automatically.",
      cta: { href: "/register", label: "GO TO DASHBOARD" },
    },
    no_registration: {
      title: (
        <>
          NOTHING
          <br />
          <span>TO CONFIRM.</span>
        </>
      ),
      copy: "We couldn't find a payment in progress for your account.",
      cta: { href: "/register", label: "GO TO DASHBOARD" },
    },
    error: {
      title: (
        <>
          COULDN&apos;T
          <br />
          <span>LOAD STATUS.</span>
        </>
      ),
      copy: errorMessage || "Something went wrong while checking your payment status.",
      cta: { href: "/register", label: "GO TO DASHBOARD" },
    },
  };

  const panel = panels[view] || panels.error;

  return (
    <main className={styles.page}>
      <div className={styles.grid} />
      <section className={styles.authPanel}>
        <p className={styles.eyebrow}>TATHVA PRESENTS</p>
        <h1 className={styles.authTitle}>{panel.title}</h1>
        <p className={styles.authCopy}>{panel.copy}</p>
        {panel.cta && (
          <Link href={panel.cta.href} className={styles.primaryButton}>
            {panel.cta.label} <span>↗</span>
          </Link>
        )}
        <Link href="/" className={styles.backLink}>
          ← BACK TO HOME
        </Link>
      </section>
      {(view === "confirmed" || view === "already_paid") && (
        <WhatsAppInvitePopup registrationId={registrationId} />
      )}
    </main>
  );
}
