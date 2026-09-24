"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./register.module.css";
import { useAuth } from "./AuthProvider";
import GoogleSignIn from "./GoogleSignIn";
import {
  fetchMyRegistration,
  getVersionedBase,
  initiatePayment,
  fetchPaymentStatus,
} from "../lib/auth";

const emptyMember = { name: "", email: "", phone: "" };
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function getApiUrl(path) {
  return `${getVersionedBase()}${path}`;
}

export default function RegisterPage() {
  const { user: currentUser, token: authToken, status, logout } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [leaderName, setLeaderName] = useState("");

  useEffect(() => {
    if (currentUser?.name && !leaderName) {
      setLeaderName(currentUser.name);
    }
  }, [currentUser, leaderName]);
  const [members, setMembers] = useState([]);
  const [formError, setFormError] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const [registration, setRegistration] = useState(null);
  const [regInfo, setRegInfo] = useState({ fetchedFor: "", loaded: false, registered: false, data: null });
  const [showEditor, setShowEditor] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  // Leader must confirm the roster is final before paying - once payment
  // starts the draft moves to PAYMENT_PENDING and can no longer be edited.
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const [payState, setPayState] = useState("idle"); // idle | starting | error
  const [payError, setPayError] = useState("");
  const [statusCheck, setStatusCheck] = useState({ checking: false, error: "" });
  // Guards the automatic one-shot reconcile below so it fires once per
  // booking, not on every render.
  const autoCheckedBookingRef = useRef(null);

  // Loads (or reloads) the leader's current team + payment status.
  const loadRegistration = (tokenForFetch) => {
    let cancelled = false;
    fetchMyRegistration(tokenForFetch)
      .then((data) => {
        if (cancelled) return;
        const registered = Boolean(data.registered && data.status);
        setRegInfo({ fetchedFor: tokenForFetch, loaded: true, registered, data: registered ? data : null });

        // If the new user has NO team, clear out any old form data left behind by the previous user
        if (!registered) {
          setTeamName("");
          setCollegeName("");
          setLeaderPhone("");
          setMembers([]);
          setFormError("");
          setSubmitState("idle");
          setRegistration(null);
          setShowEditor(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setRegInfo({ fetchedFor: tokenForFetch, loaded: true, registered: false, data: null });
        setTeamName("");
        setCollegeName("");
        setLeaderPhone("");
        setMembers([]);
        setFormError("");
        setSubmitState("idle");
        setRegistration(null);
        setShowEditor(false);
      });
    return () => {
      cancelled = true;
    };
  };

  // Load the leader's current team so they can view it
  useEffect(() => {
    if (status !== "authenticated" || !authToken) return;
    return loadRegistration(authToken);
  }, [status, authToken]);

  // Self-healing check: there is no webhook (see hackathon-backend/PAYMENT_FLOW.md),
  // so a booking that was actually confirmed at TIQR while the user wasn't on
  // the /registration/return page would otherwise sit PAYMENT_PENDING forever.
  // Landing on the dashboard with a pending booking nudges the backend to
  // reconcile live against TIQR once, then refreshes.
  useEffect(() => {
    const bookingUid = regInfo.data?.payment?.tiqrBookingUid;
    if (regInfo.data?.status !== "PAYMENT_PENDING" || !bookingUid) return;
    if (autoCheckedBookingRef.current === bookingUid) return;
    autoCheckedBookingRef.current = bookingUid;

    fetchPaymentStatus(bookingUid)
      .then((result) => {
        if (result.status !== regInfo.data?.payment?.status) {
          loadRegistration(authToken);
        }
      })
      .catch(() => {
        // Best-effort: leave the dashboard showing the last known status.
      });
  }, [regInfo.data, authToken]);

  const handleCheckStatus = async () => {
    const bookingUid = regInfo.data?.payment?.tiqrBookingUid;
    if (!bookingUid) return;
    setStatusCheck({ checking: true, error: "" });
    try {
      await fetchPaymentStatus(bookingUid);
      loadRegistration(authToken);
      setStatusCheck({ checking: false, error: "" });
    } catch (error) {
      setStatusCheck({ checking: false, error: error.message || "Could not check payment status." });
    }
  };

  const handlePayNow = async () => {
    const registrationId = regInfo.data?.registrationId;
    if (!registrationId) return;
    setPayState("starting");
    setPayError("");
    try {
      const data = await initiatePayment(registrationId);
      const redirectUrl = data?.tiqr?.redirectUrl;
      if (!redirectUrl) {
        throw new Error("Payment provider did not return a checkout link. Please try again.");
      }
      window.location.href = redirectUrl;
    } catch (error) {
      setPayState("idle");
      setPayError(error.message || "Could not start payment. Please try again.");
      // A failure here can mean the backend just expired this booking window
      // server-side (e.g. EXPIRED) - refresh so the dashboard reflects that
      // instead of showing a stale PAYMENT_PENDING view with just an error.
      loadRegistration(authToken);
    }
  };

  const handleEditTeam = () => {
    const reg = regInfo.data;
    setTeamName(reg.teamName || "");
    setCollegeName(reg.collegeName || "");
    
    // Extract leader phone, and keep other members in the array
    if (reg.members) {
      const leader = reg.members.find(m => m.isLeader);
      if (leader) {
        setLeaderPhone(leader.phone);
        setLeaderName(leader.name);
      }
      
      const otherMembers = reg.members.filter(m => !m.isLeader).map(m => ({
        name: m.name,
        email: m.email,
        phone: m.phone
      }));
      setMembers(otherMembers);
    }
    
    setShowEditor(true);
  };

  const addMember = () => {
    if (members.length < 3)
      setMembers((current) => [...current, { ...emptyMember }]);
  };

  const removeMember = (index) => {
    setMembers((current) =>
      current.filter((_, memberIndex) => memberIndex !== index),
    );
  };

  const updateMember = (index, field, value) => {
    setMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member,
      ),
    );
  };

  const validateForm = () => {
    if (!teamName.trim() || !collegeName.trim() || !leaderPhone.trim() || !leaderName.trim()) {
      return "Add your team name, college, leader name, and phone number.";
    }

    if (!/^\+?[0-9\s-]{10,15}$/.test(leaderPhone.trim())) {
      return "Enter a valid leader phone number.";
    }

    for (const member of members) {
      if (!member.name.trim() || !member.email.trim() || !member.phone.trim()) {
        return "Complete every field for each team member.";
      }
      if (!/^\S+@\S+\.\S+$/.test(member.email.trim())) {
        return "Enter a valid email for every team member.";
      }
      if (!/^\+?[0-9\s-]{10,15}$/.test(member.phone.trim())) {
        return "Enter a valid phone number for every team member.";
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError("");
    setSubmitState("submitting");

    try {
      const isUpdating = regInfo.registered;
      const url = getApiUrl(isUpdating ? "/registrations/me" : "/registrations");
      const method = isUpdating ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName: teamName.trim(),
          collegeName: collegeName.trim(),
          members: [
            {
              name: leaderName.trim() || currentUser.name,
              email: currentUser.email,
              phone: leaderPhone.trim(),
              isLeader: true,
            },
            ...members.map((member) => ({
              name: member.name.trim(),
              email: member.email.trim(),
              phone: member.phone.trim(),
              isLeader: false,
            })),
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data?.error?.message || (isUpdating ? "We could not update your team." : "We could not create your team."),
        );

      setRegistration(data);
      setSubmitState(isUpdating ? "updated" : "created");
    } catch (error) {
      setFormError(
        error.message || "We could not save your team. Try again.",
      );
      setSubmitState("idle");
    }
  };

  if (status === "loading") {
    return (
      <main className={styles.page}>
        <div className={styles.grid} />
        <p className={styles.loading}>LOADING...</p>
      </main>
    );
  }

  if (status === "unauthenticated" || !currentUser) {
    return (
      <main className={styles.page}>
        <div className={styles.grid} />
        <section className={styles.authPanel}>
          <p className={styles.eyebrow}>TATHVA PRESENTS</p>
          <h1 className={styles.authTitle}>
            REGISTER /
            <br />
            <span>LOGIN.</span>
          </h1>
          <p className={styles.authCopy}>
            Sign in with Google first. Your account will be added as the team
            leader automatically.
          </p>
          {googleClientId ? (
            <div className={styles.googleButton}>
              <GoogleSignIn />
            </div>
          ) : (
            <p className={styles.error} role="alert">
              Google sign-in is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID
              to the frontend environment and restart `npm run dev`.
            </p>
          )}
          {formError && (
            <p className={styles.error} role="alert">
              {formError}
            </p>
          )}
          <Link href="/" className={styles.backLink}>
            ← BACK TO HOME
          </Link>
        </section>
      </main>
    );
  }

  if (!regInfo.loaded || regInfo.fetchedFor !== authToken) {
    return (
      <main className={styles.page}>
        <div className={styles.grid} />
        <p className={styles.loading}>CHECKING REGISTRATION...</p>
      </main>
    );
  }

  const statusLabel =
    {
      DRAFT: "DRAFT",
      PAYMENT_PENDING: "AWAITING PAYMENT",
      PAID: "PAID",
    }[regInfo.data?.status] || regInfo.data?.status || "";

  if (regInfo.registered && !showEditor) {
    const reg = regInfo.data;
    return (
      <main className={styles.page}>
        <div className={styles.grid} />
        <section className={styles.authPanel}>
          <p className={styles.eyebrow}>TATHVA PRESENTS</p>
          <h1 className={styles.authTitle}>
            YOUR
            <br />
            <span>TEAM.</span>
          </h1>
          <p className={styles.authCopy}>
            {"Here is your team dashboard."}
          </p>
          <div className={styles.orderDetails}>
            <div>
              <span>TEAM</span>
              <strong>{reg.teamName}</strong>
            </div>
            <div>
              <span>COLLEGE</span>
              <strong>{reg.collegeName}</strong>
            </div>
            <div>
              <span>MEMBERS</span>
              <strong>{reg.memberCount}</strong>
            </div>
            <div>
              <span>STATUS</span>
              <strong>{statusLabel}</strong>
            </div>
            <div>
              <span>FEE</span>
              <strong>₹{Math.round(reg.amount / 100)}</strong>
            </div>
          </div>
          {reg.status === "DRAFT" && (
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleEditTeam}
              >
                EDIT TEAM DETAILS <span>↗</span>
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => {
                  setPayError("");
                  setDetailsConfirmed(false);
                  setShowPayModal(true);
                }}
              >
                PAY NOW <span>↗</span>
              </button>
            </div>
          )}
          {reg.status === "DRAFT" && payError && !showPayModal && (
            <p className={styles.error} role="alert">
              {payError}
            </p>
          )}

          {reg.status === "PAYMENT_PENDING" && (
            <>
              <p className={styles.authCopy} style={{ margin: "0 0 1rem" }}>
                We&apos;re waiting for TIQR to confirm your payment. If you already
                paid, this usually clears within a minute or two.
              </p>
              {/* No resume: a payment that was left or failed can be retried
                  once its 15-minute window is over - the backend then puts the
                  team back to DRAFT and "Pay now" starts a fresh payment. */}
              <p className={styles.error} role="status">
                {reg.expiresAt && new Date(reg.expiresAt) > new Date()
                  ? `Payment didn't go through? You can try again after ${new Date(
                      reg.expiresAt,
                    ).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} (15 minutes after you started).`
                  : "Payment didn't go through? You can try again now - click Refresh Status."}
              </p>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleCheckStatus}
                  disabled={statusCheck.checking}
                >
                  {statusCheck.checking ? "CHECKING..." : "REFRESH STATUS"} <span>↗</span>
                </button>
              </div>
              {(payError || statusCheck.error) && (
                <p className={styles.error} role="alert">
                  {payError || statusCheck.error}
                </p>
              )}
            </>
          )}

          {reg.status === "PAID" && (
            <p className={styles.authCopy} style={{ margin: "0 0 1rem" }}>
              You&apos;re all set for TatHack &apos;26. See you at the event!
            </p>
          )}

          {showPayModal && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                display: "grid",
                placeItems: "center",
                zIndex: 50,
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  width: "min(28rem, 100%)",
                  background: "#0c0c0c",
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: "1rem 1rem 0 rgba(255,255,255,0.04)",
                  padding: "2rem",
                }}
              >
                <p className={styles.eyebrow} style={{ marginBottom: "0.75rem", color: "#ff3b3b" }}>
                  CONFIRM PAYMENT
                </p>
                <p className={styles.authCopy} style={{ margin: "0 0 1.5rem" }}>
                  You&apos;re about to pay the registration fee for{" "}
                  <strong style={{ color: "#fff" }}>{reg.teamName}</strong> (
                  {reg.memberCount} member{reg.memberCount === 1 ? "" : "s"}).
                </p>
                <div className={styles.orderDetails} style={{ gridTemplateColumns: "1fr", margin: "0 0 1.5rem" }}>
                  <div>
                    <span>AMOUNT TO PAY</span>
                    <strong>₹{Math.round(reg.amount / 100)}</strong>
                  </div>
                </div>
                <p
                  role="alert"
                  style={{
                    margin: "0 0 1.5rem",
                    padding: "0.75rem 1rem",
                    border: "1px solid #ff3b3b",
                    color: "#ff8c8c",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                  }}
                >
                  Please don&apos;t press Back, refresh or close the tab during
                  payment. If you leave the payment page before finishing, you
                  will have to wait 15 minutes before you can try again.
                </p>
                <label
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "flex-start",
                    margin: "0 0 1.5rem",
                    cursor: payState === "starting" ? "wait" : "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={detailsConfirmed}
                    onChange={(e) => setDetailsConfirmed(e.target.checked)}
                    disabled={payState === "starting"}
                    style={{ marginTop: "0.2rem", flexShrink: 0, accentColor: "#fff" }}
                  />
                  <span className={styles.authCopy} style={{ margin: 0 }}>
                    I confirm that I have filled in the correct details of all my
                    teammates, and I understand that I cannot edit, add or remove
                    team details after proceeding to payment.
                  </span>
                </label>
                {payError && (
                  <p className={styles.error} role="alert">
                    {payError}
                  </p>
                )}
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={handlePayNow}
                    disabled={payState === "starting" || !detailsConfirmed}
                    style={{
                      flex: "1 1 0",
                      // Greyed out until the roster confirmation is ticked.
                      // Inline so it also overrides .primaryButton:hover.
                      ...(!detailsConfirmed && {
                        background: "#555",
                        borderColor: "#555",
                        color: "#999",
                        cursor: "not-allowed",
                        transform: "none",
                      }),
                    }}
                  >
                    {payState === "starting" ? "REDIRECTING..." : "CONTINUE"} <span>↗</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    disabled={payState === "starting"}
                    style={{
                      // Same box as .primaryButton (which carries margin-top: 1rem)
                      // so both buttons line up at equal width and height.
                      flex: "1 1 0",
                      marginTop: "1rem",
                      background: "transparent",
                      border: "1px solid #555",
                      color: "#aaa",
                      padding: "1rem 1.2rem",
                      cursor: payState === "starting" ? "wait" : "pointer",
                      font: "600 0.7rem 'Press Start 2P', monospace",
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <button
              type="button"
              onClick={logout}
              style={{
                background: "transparent",
                border: "1px solid #555",
                color: "#aaa",
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: 11,
                letterSpacing: 1,
              }}
            >
              SIGN OUT ({currentUser.email})
            </button>
          </div>
          <Link href="/" className={styles.backLink}>
            ← BACK TO HOME
          </Link>
        </section>
      </main>
    );
  }

  if (submitState === "created" || submitState === "updated") {
    return (
      <main className={styles.page}>
        <div className={styles.grid} />
        <section className={styles.successPanel}>
          <p className={styles.eyebrow}>REGISTRATION SAVED</p>
          <h1 className={styles.authTitle}>
            {submitState === "updated" ? "TEAM UPDATED." : "TEAM SECURED."}
          </h1>
          <p className={styles.authCopy}>
            {submitState === "updated"
              ? "Your team details have been updated."
              : "Your team has been successfully registered."}
          </p>
          <button
            className={styles.primaryButton}
            onClick={() => window.location.reload()}
          >
            GO TO DASHBOARD <span>↗</span>
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.grid} />
      <img src="/assets/atom.png" className={styles.atom} alt="" />
      <section className={styles.content}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>TATHVA PRESENTS</p>
          <h1>
            FORM
            <br />
            <span>YOUR SQUAD.</span>
          </h1>
          <p className={styles.introCopy}>
            One leader. Up to three teammates.
            <br />
            Make it count.
          </p>
          <div className={styles.step}>
            <span>01</span>
            <i />
            <span>TEAM REGISTRATION</span>
          </div>
          <button
            type="button"
            onClick={logout}
            style={{
              marginTop: 24,
              background: "transparent",
              border: "1px solid #555",
              color: "#aaa",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 11,
              letterSpacing: 1,
            }}
          >
            SIGN OUT ({currentUser.email})
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <span>TEAM DETAILS</span>
            <b>01 / 02</b>
          </div>
          <label>
            TEAM NAME
            <input
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="e.g. Code Warriors"
              maxLength={80}
            />
          </label>
          <label>
            COLLEGE / INSTITUTION
            <input
              value={collegeName}
              onChange={(event) => setCollegeName(event.target.value)}
              placeholder="Where are you representing?"
              maxLength={120}
            />
          </label>

          <div className={styles.formHeader}>
            <span>TEAM LEADER</span>
            <b>GOOGLE VERIFIED</b>
          </div>
          <div className={styles.leaderCard}>
            <div className={styles.avatar}>
              {currentUser.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <span>{currentUser.email}</span>
            </div>
            <em>LEADER</em>
          </div>
          <label>
            LEADER NAME
            <input
              type="text"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              placeholder="Leader Name"
              maxLength={80}
            />
          </label>
          <label>
            PHONE NUMBER
            <input
              type="tel"
              value={leaderPhone}
              onChange={(event) => setLeaderPhone(event.target.value)}
              placeholder="10-digit phone number"
            />
          </label>

          <div className={styles.formHeader}>
            <span>
              TEAMMATES <small>({members.length}/3)</small>
            </span>
            <b>OPTIONAL</b>
          </div>
          {members.map((member, index) => (
            <fieldset className={styles.memberCard} key={`member-${index}`}>
              <legend>
                MEMBER {String(index + 2).padStart(2, "0")}{" "}
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  aria-label={`Remove member ${index + 2}`}
                >
                  REMOVE
                </button>
              </legend>
              <label>
                NAME
                <input
                  type="text"
                  value={member.name}
                  onChange={(event) =>
                    updateMember(index, "name", event.target.value)
                  }
                  placeholder="Full name"
                  maxLength={80}
                />
              </label>
              <label>
                EMAIL
                <input
                  type="email"
                  value={member.email}
                  onChange={(event) =>
                    updateMember(index, "email", event.target.value)
                  }
                  placeholder="name@email.com"
                />
              </label>
              <label>
                PHONE
                <input
                  type="tel"
                  value={member.phone}
                  onChange={(event) =>
                    updateMember(index, "phone", event.target.value)
                  }
                  placeholder="10-digit phone number"
                />
              </label>
            </fieldset>
          ))}
          {members.length < 3 && (
            <button
              type="button"
              className={styles.addButton}
              onClick={addMember}
            >
              + ADD TEAMMATE{" "}
              <span>
                {3 - members.length} SLOT{members.length === 2 ? "" : "S"} LEFT
              </span>
            </button>
          )}

          {formError && (
            <p className={styles.error} role="alert">
              {formError}
            </p>
          )}
          <div className={styles.submitRow}>
            <p>
              Registration fee is calculated per member.
              <br />
              You&apos;ll see the exact amount, and pay it, from your dashboard.
            </p>
            <button
              className={styles.submitButton}
              type="submit"
              disabled={submitState === "submitting"}
            >
              {submitState === "submitting" 
                ? (regInfo.registered ? "UPDATING..." : "CREATING...") 
                : (regInfo.registered ? "UPDATE TEAM ↗" : "CREATE TEAM ↗")}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
