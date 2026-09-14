"use client";

import { useEffect, useRef } from "react";
import styles from "./pg1.module.css";
import Navbar from "./Navbar";

// ---- Milestone icons (inline SVG, copied from Stitch mockup paths) ----
function IconUserPlus() {
  return (
    <svg className={styles.milestoneIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

function IconCard() {
  return (
    <svg className={styles.milestoneIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function IconTerminal() {
  return (
    <svg className={styles.milestoneIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <polyline points="7 9 10 12 7 15" />
      <line x1="12" y1="15" x2="17" y2="15" />
    </svg>
  );
}

function IconClipboardCheck() {
  return (
    <svg className={styles.milestoneIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <polyline points="9 14 11 16 15 11" />
    </svg>
  );
}

function IconTrophy() {
  return (
    <svg className={styles.milestoneIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H8a1 1 0 0 0-1 1v1h10v-1a1 1 0 0 0-1-1h-1a1 1 0 0 1-1-1v-2.34" />
      <path d="M6 4h12a2 2 0 0 1 2 2v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

const MILESTONES = [
  { date: "SEP 15", phase: "PHASE 01", title: "Pre-Registration", desc: "Portal Opens", Icon: IconUserPlus },
  { date: "SEP 20", phase: "PHASE 02", title: "Registration & Fee", desc: "Payment Window", Icon: IconCard },
  { date: "SEP 26", phase: "PHASE 03", title: "Online Prelims", desc: "Round 1", Icon: IconTerminal },
  { date: "SEP 30", phase: "PHASE 04", title: "Prelims Result", desc: "Shortlist Published", Icon: IconClipboardCheck },
  { date: "OCT 09", phase: "PHASE 05", title: "Final Round", desc: "@ NIT Calicut Campus", Icon: IconTrophy },
];

export default function Pg1() {
  const spacerRef = useRef(null);
  const heroRef = useRef(null);
  const leftHandRef = useRef(null);
  const rightHandRef = useRef(null);
  const presentsRef = useRef(null);
  const titleRef = useRef(null);
  const dateRef = useRef(null);
  const aboutCardRef = useRef(null);
  const aboutLogoRef = useRef(null);
  const heroLogoRef = useRef(null);
  const homeNavRef = useRef(null);

  useEffect(() => {
    homeNavRef.current = document.querySelector(".navbar-home");

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    function handleScroll() {
      const spacer = spacerRef.current;
      if (!spacer) return;

      const rect = spacer.getBoundingClientRect();
      const total = spacer.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = clamp(total > 0 ? scrolled / total : 0, 0, 1);

      const handScale = 1 + progress * 0.7;
      const handOpacity = 1 - progress;
      if (leftHandRef.current) {
        leftHandRef.current.style.transform = `rotate(18deg) scale(${handScale})`;
        leftHandRef.current.style.opacity = handOpacity;
      }
      if (rightHandRef.current) {
        rightHandRef.current.style.transform = `rotate(20deg) scale(${handScale})`;
        rightHandRef.current.style.opacity = handOpacity;
      }

      const presentsProgress = clamp(progress / 0.35, 0, 1);
      if (presentsRef.current) {
        presentsRef.current.style.opacity = 1 - presentsProgress;
        presentsRef.current.style.transform = `translateY(${-60 * presentsProgress}px)`;
      }

      if (heroLogoRef.current) {
        heroLogoRef.current.style.opacity = 1 - presentsProgress;
      }

      const titleProgress = clamp((progress - 0.15) / 0.4, 0, 1);
      const titleOpacity = 1 - titleProgress;
      if (titleRef.current) {
        titleRef.current.style.opacity = titleOpacity;
        titleRef.current.style.transform = `translateY(${-30 * titleProgress}px) scale(${1 + 0.1 * titleProgress})`;
      }
      if (dateRef.current) {
        dateRef.current.style.opacity = titleOpacity;
        dateRef.current.style.transform = `translateY(${-20 * titleProgress}px)`;
      }

      const aboutProgress = clamp((progress - 0.4) / 0.6, 0, 1);
      if (aboutCardRef.current) {
        aboutCardRef.current.style.opacity = aboutProgress;
        aboutCardRef.current.style.transform = `translateY(${50 * (1 - aboutProgress)}px) scale(${0.95 + 0.05 * aboutProgress})`;
        aboutCardRef.current.style.pointerEvents = aboutProgress > 0.15 ? "auto" : "none";
      }

      if (homeNavRef.current) {
        homeNavRef.current.style.opacity = 1 - aboutProgress;
        homeNavRef.current.style.pointerEvents = aboutProgress > 0.15 ? "none" : "auto";
      }

      if (aboutLogoRef.current) {
        aboutLogoRef.current.style.opacity = aboutProgress;
        aboutLogoRef.current.style.pointerEvents = aboutProgress > 0.15 ? "auto" : "none";
      }

      if (heroRef.current) {
        heroRef.current.style.pointerEvents = progress > 0.6 ? "none" : "auto";
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (homeNavRef.current) {
        homeNavRef.current.style.opacity = "";
        homeNavRef.current.style.pointerEvents = "";
      }
    };
  }, []);

  return (
    <div className={styles.scrollSpacer} ref={spacerRef}>
      <div className={styles.stickyStage}>

        {/* ---------- HERO ---------- */}
        <main className="hero" ref={heroRef}>
          <div className="grid" />
          <img
            ref={heroLogoRef}
            src="/assets/tathva.png"
            className="logo"
            alt="Tathva '26 NIT Calicut"
          />
          <div className="hand-glow glow-left"></div>
          <img
            ref={leftHandRef}
            src="/assets/hand-left.png"
            className="decor decor-left"
            alt=""
          />

          <div className="hand-glow glow-right"></div>
          <img
            ref={rightHandRef}
            src="/assets/hand-right.png"
            className="decor decor-right"
            alt=""
          />

          <img src="/assets/whatsapp-graphic.jpg" className="decor decor-bottom" alt="" />
          <img src="/assets/atom.png" className="decor decor-top-right" alt="" />

          <section className="hero-content">
            <p className="presents" ref={presentsRef}>PRESENTS</p>

            <h1 className="title" ref={titleRef}>
              <span>TatHack</span>
              <span>&apos;26</span>
            </h1>

            <p className="date" ref={dateRef}>October 9th - 10th</p>
          </section>
        </main>

        {/* ---------- TIMELINE & MILESTONES (replaces About) ---------- */}
        <div ref={aboutLogoRef} style={{ opacity: 0, pointerEvents: "none" }}>
          <Navbar variant="inner" />
        </div>

        <div className={styles.aboutWrap}>
          <div
            className={styles.card}
            ref={aboutCardRef}
            style={{ opacity: 0, pointerEvents: "none" }}
          >
            <span className={styles.pill}>TIMELINE &amp; MILESTONES</span>

            <p className={styles.timelineIntro}>
              // Roadmap to Innovation • Tathva &apos;26 Flagship Hackathon
            </p>

            <div className={styles.timeline}>
              <div className={styles.timelineLine}></div>
              {MILESTONES.map(({ date, phase, title, desc, Icon }) => (
                <div className={styles.milestone} key={phase}>
                  <div className={styles.milestoneDate}>{date}</div>
                  <div className={styles.milestoneNode}>
                    <Icon />
                  </div>
                  <span className={styles.milestonePhase}>{phase}</span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}