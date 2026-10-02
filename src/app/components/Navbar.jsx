"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function Navbar({ variant } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isRegistered } = useAuth();

  const headerRef = useRef(null);
  const lastScrollY = useRef(0);
  const offsetY = useRef(0);

  const getScrollY = useCallback((scrollEl) => {
    if (scrollEl && scrollEl !== window) {
      return scrollEl.scrollTop;
    }
    return window.scrollY;
  }, []);

  const applyScroll = useCallback((scrollEl) => {
    // Only hide/show on mobile
    if (window.innerWidth > 768) {
      offsetY.current = 0;
      lastScrollY.current = getScrollY(scrollEl);
      if (headerRef.current) {
        headerRef.current.style.transform = "translateY(0px)";
      }
      return;
    }

    const currentY = getScrollY(scrollEl);
    const delta = currentY - lastScrollY.current;
    const navHeight = headerRef.current?.offsetHeight || 140;

    // Accumulate offset, clamp between -navHeight and 0
    offsetY.current = Math.min(0, Math.max(-navHeight, offsetY.current - delta));

    // If near the top, always show fully
    if (currentY <= 10) {
      offsetY.current = 0;
    }

    if (headerRef.current) {
      headerRef.current.style.transform = `translateY(${offsetY.current}px)`;
    }

    lastScrollY.current = currentY;
  }, [getScrollY]);

  useEffect(() => {
    // Reset on route change
    lastScrollY.current = 0;
    offsetY.current = 0;
    if (headerRef.current) {
      headerRef.current.style.transform = "translateY(0px)";
    }

    // Find scrollable containers (pages with overflow-y: auto/scroll)
    const scrollContainers = document.querySelectorAll("main");
    const targets = [];

    scrollContainers.forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.overflowY === "auto" || style.overflowY === "scroll") {
        targets.push(el);
      }
    });

    // Always listen on window too
    const handleWindowScroll = () => applyScroll(window);
    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    const handlers = targets.map((el) => {
      const handler = () => applyScroll(el);
      el.addEventListener("scroll", handler, { passive: true });
      return { el, handler };
    });

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
      handlers.forEach(({ el, handler }) => el.removeEventListener("scroll", handler));
    };
  }, [pathname, applyScroll]);

  const handleSignup = () => {
    router.push("/register");
  };

  // variant lets a caller force "home" or "inner" layout regardless of route
  const isHome = variant ? variant === "home" : pathname === "/";
  const isPrizesActive = pathname === "/prizes" || pathname === "/prize";
  const isSponsorsActive = pathname === "/sponsors" || pathname === "/sponsor";

  if (pathname.startsWith("/admin")) return null;

  if (isHome) {
    return (
      <header ref={headerRef} className="navbar navbar-home">
        <Link
          href="/"
          className="logo-brand"
          id="navbar-home-logo"
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          <img
            src="/assets/tathva.png"
            alt="Tathva '26 NIT Calicut"
            className="logo-img"
          />
          <span className="brand-title">TatHack &apos;26</span>
        </Link>
        <nav className="nav-actions" aria-label="Event navigation">
          <Link href="/prizes">Prizes</Link>
          <Link href="/sponsors">Sponsors</Link>
          {/* <Link href="/rules">Rules</Link> */}
          <Link href="/faq">FAQ</Link>
          <button className="signup-btn" onClick={handleSignup}>
            {isRegistered ? "Dashboard" : "Register"}
          </button>
        </nav>
      </header>
    );
  }

  return (
    <header ref={headerRef} className="navbar navbar-inner">
      <Link href="/" className="logo-brand">
        <img
          src="/assets/tathva.png"
          alt="Tathva '26 NIT Calicut"
          className="logo-img"
        />
        <span className="brand-title">TatHack &apos;26</span>
      </Link>

      <nav className="nav-actions" aria-label="Event navigation">
        <Link
          href="/prizes"
          className={isPrizesActive ? "nav-link active" : "nav-link"}
        >
          Prizes
        </Link>
        <Link
          href="/sponsors"
          className={isSponsorsActive ? "nav-link active" : "nav-link"}
        >
          Sponsors
        </Link>
        {/* <Link
          href="/rules"
          className={pathname === "/rules" ? "nav-link active" : "nav-link"}
        >
          Rules
        </Link> */}
        <Link
          href="/faq"
          className={pathname === "/faq" ? "nav-link active" : "nav-link"}
        >
          FAQ
        </Link>
        <button className="signup-btn" onClick={handleSignup}>
          {isRegistered ? "Dashboard" : "Register"}
        </button>
      </nav>
    </header>
  );
}
