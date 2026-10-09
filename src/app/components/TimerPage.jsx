"use client";

import VaporCountdown from "./VaporCountdown";

// Hackathon finale: Oct 10, 2026 — 12:00 PM IST
const HACKATHON_END = new Date("2026-10-10T12:00:00+05:30");

export default function TimerPage() {
  return (
    <main className="timer-page page-transition">
      {/* Background grid */}
      <div className="grid" />

      {/* Decorative assets mirroring other inner pages */}
      <img src="/assets/atom.png" className="decor decor-top-right" alt="" />
      <img
        src="/assets/whatsapp-graphic.jpg"
        className="decor decor-bottom"
        alt=""
      />

      {/* Floating hand decor */}
      <img
        src="/assets/hand-left.png"
        className="decor timer-hand-left"
        alt=""
      />
      <img
        src="/assets/hand-right.png"
        className="decor timer-hand-right"
        alt=""
      />

      {/* Main content */}
      <div className="timer-content">
        {/* Top badge — same pill style as Prize / FAQ pages */}
        <div className="timer-pill-badge">
          <span>COUNTDOWN</span>
        </div>

        {/* Eyebrow label */}
        <p className="timer-eyebrow">TATHACK &apos;26 FINALE</p>

        {/* The particle countdown */}
        <div className="timer-countdown-wrapper">
          <VaporCountdown
            targetDate={HACKATHON_END}
            labels={["HOURS", "MINUTES", "SECONDS"]}
          />
        </div>

        {/* Event date pill */}
        <div className="timer-date-pill">
          <span className="timer-date-dot" />
          <span>OCT 10 &nbsp;·&nbsp; NIT CALICUT</span>
        </div>

      </div>
    </main>
  );
}
