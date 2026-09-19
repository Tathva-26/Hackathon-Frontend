"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./pg1.module.css";
import Navbar from "./Navbar";

export default function Pg1() {
  const router = useRouter();
  const spacerRef = useRef(null);
  const heroRef = useRef(null);
  const leftHandRef = useRef(null);
  const rightHandRef = useRef(null);
  const presentsRef = useRef(null);
  const titleRef = useRef(null);
  const dateRef = useRef(null);
  const preRegRef = useRef(null);
  const aboutCardRef = useRef(null);
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

      const holdPoint = 0.50 * total;

      // Trap going DOWN (Hero -> About)
      if (scrolled >= holdPoint && lastScrolled < holdPoint && gestureActive) {
        isLocked = true;
        setTimeout(() => { isLocked = false; }, 800); // 800ms absolute trackpad momentum release
        if (typeof window !== 'undefined' && window.innerWidth <= 640) document.body.style.overflow = 'hidden';
        window.scrollTo({ top: window.scrollY + rect.top + holdPoint });
      }

      // Trap going UP (Sponsors -> About)
      if (scrolled <= holdPoint && lastScrolled > holdPoint && gestureActive) {
        isLocked = true;
        setTimeout(() => { isLocked = false; }, 800); // 800ms absolute trackpad momentum release
        if (typeof window !== 'undefined' && window.innerWidth <= 640) document.body.style.overflow = 'hidden';
        window.scrollTo({ top: window.scrollY + rect.top + holdPoint });
      }

      lastScrolled = scrolled;

      // `progress` scales automatically exactly to the component's CSS scroll coordinates!
      const progress = clamp(total > 0 ? scrolled / total : 0, 0, 1);

      // Phase 1 (0 to 0.50 of total scroll) maps exactly against original sizing specs
      const progress1 = clamp(progress / 0.50, 0, 1);

      // Phase 2 (0.50 to 1.0 of total scroll) handles the injected Sponsors screen
      const progress2 = clamp((progress - 0.50) / 0.50, 0, 1);

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
      const aboutProgress = clamp((progress1 - 0.4) / 0.6, 0, 1);
      const aboutFadeOut = clamp(progress2 / 0.4, 0, 1);
      const aboutFinalOpacity = aboutProgress - aboutFadeOut;

      if (aboutCardRef.current) {
        aboutCardRef.current.style.opacity = aboutFinalOpacity;
        aboutCardRef.current.style.transform = `translateY(${50 * (1 - aboutProgress) + 50 * aboutFadeOut}px) scale(${0.95 + 0.05 * aboutProgress - 0.05 * aboutFadeOut})`;
        aboutCardRef.current.style.pointerEvents = aboutFinalOpacity > 0.5 ? "auto" : "none";
      }

      // --- Sponsors card: fade + rise in
      const sponsorsIn = clamp((progress2 - 0.4) / 0.6, 0, 1);
      if (sponsorsCardRef.current) {
        sponsorsCardRef.current.style.opacity = sponsorsIn;
        sponsorsCardRef.current.style.transform = `translateY(${50 * (1 - sponsorsIn)}px) scale(${0.95 + 0.05 * sponsorsIn})`;
        sponsorsCardRef.current.style.pointerEvents = sponsorsIn > 0.5 ? "auto" : "none";
      }

      // --- Home navbar logo fade-in: perfectly synced with About page ---
      const navLogo = document.getElementById("navbar-home-logo");
      if (navLogo) {
        navLogo.style.opacity = aboutProgress;
        navLogo.style.pointerEvents = aboutProgress > 0.15 ? "auto" : "none";
      }



      // Hero stops intercepting clicks once mostly faded out
      if (heroRef.current) {
        heroRef.current.style.pointerEvents = progress1 > 0.6 ? "none" : "auto";
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
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
                TatHack ’26, the flagship hackathon of Tathva ’26 at NIT Calicut, is here. Take on a unique online preliminary round where you’ll debug, adapt, and transform existing code into your own solution. The top teams advance to the Grand Finale at NIT Calicut on 8–9 October 2026 for a 30-hour hackathon and a shot at the ₹1,00,000 prize pool.
              </p>

              <div className={styles.buttonRow}>
                <button
                  className={styles.button}
                  onClick={() => router.push('/register')}
                >
                  REGISTER NOW
                </button>
                <button className={styles.button}>SEE SCHEDULE</button>
              </div>
            </div>
          </div>

          {/* ---------- SPONSORS ---------- */}
          <div className={`${styles.spWrap} mt-15`}>
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
                <div style={{ marginTop: '24px', paddingBottom: '12px', textAlign: 'center', fontFamily: '"Inter", sans-serif', fontSize: '15px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <p style={{ margin: '6px 0' }}>Interested in partnering with us?<br/>reach out to us at:</p>
                  <p style={{ margin: '6px 0' }}>Contact: +91 9188590540</p>
                  <p style={{ margin: '6px 0' }}>Email: rahan10749@gmail.com</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}