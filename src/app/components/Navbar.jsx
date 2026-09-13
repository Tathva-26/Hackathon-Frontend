"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const handleSignup = () => {
    window.location.href = "#register";
  };

  const isHome = pathname === "/";
  const isPrizesActive = pathname === "/prizes" || pathname === "/prize";

  if (isHome) {
    // Original Landing Page Navbar
    return (
      <header className="navbar navbar-home">
        <Link href="/" className="logo">
          <img src="/assets/tathva.png" alt="Tathva '26 NIT Calicut" />
        </Link>

        <nav className="nav-actions" aria-label="Event navigation">
          <Link href="/prizes">Prizes</Link>
          <Link href="/sponsors">Sponsors</Link>
          <Link href="/rules">Rules</Link>
          <Link href="/faq">FAQ</Link>
          <button className="signup-btn" onClick={handleSignup}>
            Sign Up
          </button>
        </nav>
      </header>
    );
  }

  // Inner Pages (e.g. Prize Page) Navbar
  return (
    <header className="navbar navbar-inner">
      <Link href="/" className="logo-brand">
        <img src="/assets/tathva.png" alt="Tathva '26 NIT Calicut" className="logo-img" />
        <span className="brand-title">TatHack &apos;26</span>
      </Link>

      <nav className="nav-actions" aria-label="Event navigation">
        <Link href="/prizes" className={isPrizesActive ? "nav-link active" : "nav-link"}>
          Prizes
        </Link>
        <Link href="/sponsors" className={pathname === "/sponsors" ? "nav-link active" : "nav-link"}>
          Sponsors
        </Link>
        <Link href="/rules" className={pathname === "/rules" ? "nav-link active" : "nav-link"}>
          Rules
        </Link>
        <Link href="/faq" className={pathname === "/faq" ? "nav-link active" : "nav-link"}>
          FAQ
        </Link>
        <button className="signup-btn" onClick={handleSignup}>
          Sign Up
        </button>
      </nav>
    </header>
  );
}