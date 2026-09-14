"use client";

import { useEffect, useRef } from "react";
import styles from "./pg1.module.css";
import Navbar from "./Navbar";

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

      // progress = how far we've scrolled through the sticky stage (0 to 1)
      const rect = spacer.getBoundingClientRect();
      const total = spacer.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = clamp(total > 0 ? scrolled / total : 0, 0, 1);

      // --- hands: enlarge + fade across the whole scroll ---
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

      // --- "PRESENTS": floats up and disappears early ---
      const presentsProgress = clamp(progress / 0.35, 0, 1);
      if (presentsRef.current) {
        presentsRef.current.style.opacity = 1 - presentsProgress;
        presentsRef.current.style.transform = `translateY(${-60 * presentsProgress}px)`;
      }

      // --- Hero logo: fades out in place, same timing as PRESENTS ---
      if (heroLogoRef.current) {
        heroLogoRef.current.style.opacity = 1 - presentsProgress;
      }

      // --- Title + date: fade out shortly after ---
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

      // --- About card / logo: fade + rise in for the last stretch ---
      const aboutProgress = clamp((progress - 0.4) / 0.6, 0, 1);
      if (aboutCardRef.current) {
        aboutCardRef.current.style.opacity = aboutProgress;
        aboutCardRef.current.style.transform = `translateY(${50 * (1 - aboutProgress)}px) scale(${0.95 + 0.05 * aboutProgress})`;
        aboutCardRef.current.style.pointerEvents = aboutProgress > 0.15 ? "auto" : "none";
      }

      // --- Home navbar: fades out as the inner About-page navbar fades in ---
      if (homeNavRef.current) {
        homeNavRef.current.style.opacity = 1 - aboutProgress;
        homeNavRef.current.style.pointerEvents = aboutProgress > 0.15 ? "none" : "auto";
      }

      if (aboutLogoRef.current) {
        aboutLogoRef.current.style.opacity = aboutProgress;
        aboutLogoRef.current.style.pointerEvents = aboutProgress > 0.15 ? "auto" : "none";
      }

      // Hero stops intercepting clicks once mostly faded out
      if (heroRef.current) {
        heroRef.current.style.pointerEvents = progress > 0.6 ? "none" : "auto";
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      // Reset any inline styles we imperatively set on the shared Navbar DOM node,
      // since React reuses that node across route changes and won't clear these itself.
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

        {/* ---------- ABOUT ---------- */}
        <div ref={aboutLogoRef} style={{ opacity: 0, pointerEvents: "none" }}>
          <Navbar variant="inner" />
        </div>

        <div className={styles.aboutWrap}>
          <div
            className={styles.card}
            ref={aboutCardRef}
            style={{ opacity: 0, pointerEvents: "none" }}
          >
            <span className={styles.pill}>ABOUT</span>

            <p className={styles.description}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>

            <div className={styles.buttonRow}>
              <button className={styles.button}>REGISTER NOW</button>
              <button className={styles.button}>SEE SCHEDULE</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}