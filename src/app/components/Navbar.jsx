"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function Navbar({ variant } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isRegistered } = useAuth();

  const handleSignup = () => {
    router.push("/register");
  };

  // variant lets a caller force "home" or "inner" layout regardless of route
  const isHome = variant ? variant === "home" : pathname === "/";
  const isPrizesActive = pathname === "/prizes" || pathname === "/prize";

  if (pathname.startsWith("/admin")) return null;

  if (isHome) {
    return (
      <header className="navbar navbar-home">
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
          <Link href="/#sponsors">Sponsors</Link>
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
    <header className="navbar navbar-inner">
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
        <Link href="/#sponsors" className="nav-link">
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
