"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./pg1.module.css";
import Navbar from "./Navbar";
import { useAuth } from "./AuthProvider";


// ---- Milestone icons ----
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
  { date: "SEP 20", phase: "PHASE 01", title: "Pre-Registration", desc: "Portal Opens", Icon: IconUserPlus },
  { date: "TBI", phase: "PHASE 02", title: "Registration & Fee", desc: "Payment Window", Icon: IconCard },
  { date: "TBI", phase: "PHASE 03", title: "Online Prelims", desc: "Round 1", Icon: IconTerminal },
  { date: "OCT 1", phase: "PHASE 04", title: "Prelims Result", desc: "Shortlist Published", Icon: IconClipboardCheck },
  { date: "OCT 09", phase: "PHASE 05", title: "Final Round", desc: "@ NIT Calicut Campus", Icon: IconTrophy },
];

export default function Pg1() {

  const handleSeeSchedule = () => {
    if (spacerRef.current) {
      const total = spacerRef.current.offsetHeight - window.innerHeight;
      window.scrollTo({ top: spacerRef.current.offsetTop + total * 0.6666, behavior: 'smooth' });
    }
  };

  const router = useRouter();
  const { isRegistered } = useAuth();
  const spacerRef = useRef(null);
  const heroRef = useRef(null);
  const leftHandRef = useRef(null);
  const rightHandRef = useRef(null);
  const presentsRef = useRef(null);
  const titleRef = useRef(null);
  const dateRef = useRef(null);
  const preRegRef = useRef(null);
  const aboutCardRef = useRef(null);
  const timelineCardRef = useRef(null);
  const sponsorsCardRef = useRef(null);
  const heroLogoRef = useRef(null);
  const homeNavRef = useRef(null);

  useEffect(() => {
    homeNavRef.current = document.querySelector(".navbar-home");

    // Gesture logic states
    let isLocked = false;
    let gestureActive = false;
    let wheelTimeout = null;
    let lastScrolled = 0;

    const handleTouchStart = () => { gestureActive = true; };
    const handleTouchEnd = () => {
      gestureActive = false;
      isLocked = false;
      document.body.style.overflow = '';
    };

    const handleWheel = (e) => {
      gestureActive = true;
      if (wheelTimeout) clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        gestureActive = false;
      }, 200);

      if (isLocked) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e) => {
      if (isLocked) {
        if (e.cancelable) e.preventDefault();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchend', handleTouchEnd, { passive: true });
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    function handleScroll() {
      const spacer = spacerRef.current;
      if (!spacer) return;

      const rect = spacer.getBoundingClientRect();
      const total = spacer.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;

      const holdPoint1 = 0.3333 * total;
      const holdPoint2 = 0.6666 * total;

      lastScrolled = scrolled;

      const progress = clamp(total > 0 ? scrolled / total : 0, 0, 1);
      const progress1 = clamp(progress / 0.3333, 0, 1);
      const progress2 = clamp((progress - 0.3333) / 0.3333, 0, 1);
      const progress3 = clamp((progress - 0.6666) / 0.3333, 0, 1);

      // --- hands: enlarge + fade earlier so they don't block About ---
      const handScale = 1 + progress1 * 0.7;
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
      const handOpacity = isMobile ? 1 - clamp(progress1 / 0.4, 0, 1) : 1 - progress1;
      if (leftHandRef.current) {
        leftHandRef.current.style.transform = `rotate(18deg) scale(${handScale})`;
        leftHandRef.current.style.opacity = handOpacity;
      }
      if (rightHandRef.current) {
        rightHandRef.current.style.transform = `rotate(20deg) scale(${handScale})`;
        rightHandRef.current.style.opacity = handOpacity;
      }

      // --- "PRESENTS": floats up and disappears early ---
      const presentsProgress = clamp(progress1 / 0.35, 0, 1);
      if (presentsRef.current) {
        presentsRef.current.style.opacity = 1 - presentsProgress;
        presentsRef.current.style.transform = `translateY(${-60 * presentsProgress}px)`;
      }

      // --- Hero logo: fades out in place, same timing as PRESENTS ---
      if (heroLogoRef.current) {
        heroLogoRef.current.style.opacity = 1 - presentsProgress;
      }

      // --- Title + date: fade out shortly after ---
      const titleProgress = clamp((progress1 - 0.15) / 0.4, 0, 1);
      const titleOpacity = 1 - titleProgress;
      if (titleRef.current) {
        titleRef.current.style.opacity = titleOpacity;
        titleRef.current.style.transform = `translateY(${-30 * titleProgress}px) scale(${1 + 0.1 * titleProgress})`;
      }
      if (dateRef.current) {
        dateRef.current.style.opacity = titleOpacity;
        dateRef.current.style.transform = `translateY(${-20 * titleProgress}px)`;
      }
      if (preRegRef.current) {
        preRegRef.current.style.opacity = titleOpacity;
        preRegRef.current.style.transform = `translateY(${-20 * titleProgress}px)`;
      }

      // --- About card / logo: fade + rise in for the last stretch ---
      // About card
      const aboutProgress = clamp((progress1 - 0.4) / 0.6, 0, 1);
      const aboutFadeOut = clamp(progress2 / 0.4, 0, 1);
      const aboutFinalOpacity = aboutProgress - aboutFadeOut;

      if (aboutCardRef.current) {
        aboutCardRef.current.style.opacity = aboutFinalOpacity;
        aboutCardRef.current.style.transform = `translateY(${50 * (1 - aboutProgress) + 50 * aboutFadeOut}px) scale(${0.95 + 0.05 * aboutProgress - 0.05 * aboutFadeOut})`;
        aboutCardRef.current.style.pointerEvents = aboutFinalOpacity > 0.5 ? "auto" : "none";
      }

      // Timeline card
      const timelineIn = clamp((progress2 - 0.4) / 0.6, 0, 1);
      const timelineFadeOut = clamp(progress3 / 0.4, 0, 1);
      const timelineFinalOpacity = timelineIn - timelineFadeOut;
      if (timelineCardRef.current) {
        timelineCardRef.current.style.opacity = timelineFinalOpacity;
        timelineCardRef.current.style.transform = `translateY(${50 * (1 - timelineIn) + 50 * timelineFadeOut}px) scale(${0.95 + 0.05 * timelineIn - 0.05 * timelineFadeOut})`;
        timelineCardRef.current.style.pointerEvents = timelineFinalOpacity > 0.5 ? "auto" : "none";
      }

      // Sponsors card
      const sponsorsIn = clamp((progress3 - 0.4) / 0.6, 0, 1);
      if (sponsorsCardRef.current) {
        sponsorsCardRef.current.style.opacity = sponsorsIn;
        sponsorsCardRef.current.style.transform = `translateY(${50 * (1 - sponsorsIn)}px) scale(${0.95 + 0.05 * sponsorsIn})`;
        sponsorsCardRef.current.style.pointerEvents = sponsorsIn > 0.5 ? "auto" : "none";
      }

      // --- Home navbar logo fade-in: perfectly synced with About page (desktop only) ---
      const navLogo = document.getElementById("navbar-home-logo");
      if (navLogo) {
        if (typeof window !== 'undefined' && window.innerWidth > 768) {
          navLogo.style.opacity = aboutProgress;
          navLogo.style.pointerEvents = aboutProgress > 0.15 ? "auto" : "none";
        } else {
          navLogo.style.opacity = "0";
          navLogo.style.pointerEvents = "none";
        }
      }

      // Hero stops intercepting clicks once mostly faded out and fades out entirely
      if (heroRef.current) {
        heroRef.current.style.pointerEvents = progress1 > 0.6 ? "none" : "auto";
        heroRef.current.style.opacity = clamp(1 - progress1 * 1.5, 0, 1);
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      if (wheelTimeout) clearTimeout(wheelTimeout);

      // Reset any inline styles we imperatively set on the shared Navbar DOM node,
      // since React reuses that node across route changes and won't clear these itself.
      if (homeNavRef.current) {
        homeNavRef.current.style.opacity = "";
        homeNavRef.current.style.pointerEvents = "";
      }
      const navLogo = document.getElementById("navbar-home-logo");
      if (navLogo) {
        navLogo.style.opacity = "";
        navLogo.style.pointerEvents = "";
      }
    };
  }, []);

  return (
    <>
      <div className={styles.scrollSpacer} ref={spacerRef}>
        {/* Anchor for Navbar link routing */}
        <div id="sponsors" style={{ position: "absolute", top: "460svh", left: 0 }} />
        <div className={styles.stickyStage}>

          {/* ---------- HERO ---------- */}
          <main className="hero" ref={heroRef}>
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

              <div
                className="pre-reg-badge"
                ref={preRegRef}
                onClick={() => router.push('/register')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    router.push('/register');
                  }
                }}
              >
                <span className="pre-reg-dot"></span>
                <span>Pre-registrations Open Now</span>
              </div>
            </section>
          </main>

          {/* ---------- ABOUT ---------- */}

          <div className={`${styles.aboutWrap} mb-25 lg:mt-15`}>
            <div
              className={`prize-card-container ${styles.card} ${styles.aboutCardWrapper}`}
              ref={aboutCardRef}
              style={{ opacity: 0, pointerEvents: "none" }}
            >
              <span className={styles.pill}>TatHack</span>

              <p className={styles.description}>
                TatHack ’26, the flagship hackathon of Tathva ’26 at NIT Calicut, is here. Take on a unique online preliminary round where you’ll debug, adapt, and transform existing code into your own solution. The top teams advance to the Grand Finale at NIT Calicut on 9-10 October 2026 for a 30-hour hackathon and a shot at the ₹1,00,000 prize pool.
              </p>

              <div className={styles.buttonRow}>
                <button
                  className={styles.button}
                  onClick={() => router.push('/register')}
                >
                  {isRegistered ? "DASHBOARD" : "REGISTER NOW"}
                </button>
                <button className={styles.button} onClick={handleSeeSchedule}>SEE SCHEDULE</button>
                <button
                  className={styles.button}
                  onClick={() => window.open('https://drive.google.com/file/d/1KYHz6SLjkVGrVMKwMLxXaYrxqvZnnBr-/view', '_blank', 'noopener,noreferrer')}
                >
                  VIEW BROCHURE
                </button>
              </div>
            </div>
          </div>

          
          {/* ---------- TIMELINE & MILESTONES ---------- */}
          <div className={`${styles.aboutWrap} mb-25 lg:mt-15`}>
            <div
              className={`prize-card-container ${styles.card} ${styles.timelineCardWrapper}`}
              ref={timelineCardRef}
              style={{ opacity: 0, pointerEvents: "none" }}
            >
              <span className={styles.pill}>TIMELINE &amp; MILESTONES</span>
              <p className={styles.timelineIntro}>
                {'// Roadmap to Innovation'} • Tathva &apos;26 Flagship Hackathon
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

          {/* ---------- SPONSORS ---------- */}
          <div className={`${styles.spWrap} lg:mt-15`}>
            <div
              ref={sponsorsCardRef}
              className={`${styles.sponsorsCardWrapper}`}
              style={{
                opacity: 0,
                pointerEvents: "none"
              }}
            >
              <div className={`prize-card-container ${styles.card}`}>
                <div className="prize-pill-badge">
                  <span>SPONSORS</span>
                </div>
                <div className="sponsors-content-wrapper">
                  <p className="sponsors-subtext">REVEALED SOON</p>
                  <div className="sponsors-placeholder-grid">
                    <div className="sponsor-box">
                      <span className="sponsor-badge-tag">TITLE SPONSOR</span>
                      <div className="sponsor-slot">COMING SOON</div>
                    </div>
                    <div className="sponsor-box">
                      <span className="sponsor-badge-tag">POWERED BY</span>
                      <div className="sponsor-slot">COMING SOON</div>
                    </div>
                    <div className="sponsor-box">
                      <span className="sponsor-badge-tag">PLATINUM PARTNER</span>
                      <div className="sponsor-slot">COMING SOON</div>
                    </div>
                  </div>
                </div>

                {/* Contacts Info */}
                <div className={styles.sponsorsContact}>
                  <p>Interested in partnering with us?<br/>reach out to us at:</p>
                  <p>Contact: +91 9188590540</p>
                  <p>Email: rahan10749@gmail.com</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}