"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./register.module.css";
import { useAuth } from "./AuthProvider";
import GoogleSignIn from "./GoogleSignIn";
import { fetchMyRegistration, getVersionedBase } from "../lib/auth";

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
  const [members, setMembers] = useState([]);
  const [formError, setFormError] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const [registration, setRegistration] = useState(null);
  const [regInfo, setRegInfo] = useState({ fetchedFor: "", loaded: false, registered: false, data: null });
  const [showEditor, setShowEditor] = useState(false);
  // Load the leader's current team so they can view it
  useEffect(() => {
    if (status !== "authenticated" || !authToken) return;
    let cancelled = false;
    fetchMyRegistration(authToken)
      .then((data) => {
        if (cancelled) return;
        const registered = Boolean(data.registered && data.status);
        setRegInfo({ fetchedFor: authToken, loaded: true, registered, data: registered ? data : null });
        
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
        setRegInfo({ fetchedFor: authToken, loaded: true, registered: false, data: null });
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
  }, [status, authToken]);

  const handleEditTeam = () => {
    const reg = regInfo.data;
    setTeamName(reg.teamName || "");
    setCollegeName(reg.collegeName || "");
    
    // Extract leader phone, and keep other members in the array
    if (reg.members) {
      const leader = reg.members.find(m => m.isLeader);
      if (leader) setLeaderPhone(leader.phone);
      
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
    if (!teamName.trim() || !collegeName.trim() || !leaderPhone.trim()) {
      return "Add your team name, college, and leader phone number.";
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          teamName: teamName.trim(),
          collegeName: collegeName.trim(),
          members: [
            {
              name: currentUser.name,
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
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleEditTeam}
          >
            EDIT TEAM DETAILS <span>↗</span>
          </button>
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
              <strong>{currentUser.name}</strong>
              <span>{currentUser.email}</span>
            </div>
            <em>LEADER</em>
          </div>
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
                  value={member.name}
                  onChange={(event) =>
                    updateMember(index, "name", event.target.value)
                  }
                  placeholder="Full name"
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
              Fee = 150 * team size
              <br />
              To be collected later
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
