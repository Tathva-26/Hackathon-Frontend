"use client";

export default function Navbar() {
  const handleSignup = () => {
    window.location.href = "#register";
  };

  return (
    <header className="navbar">
      <a href="/" className="logo">
        <img src="/assets/tathva.png" alt="Tathva '26 NIT Calicut" />
      </a>

      <nav className="nav-actions" aria-label="Event navigation">
        <a href="/prizes">Prizes</a>
        <a href="/sponsors">Sponsors</a>
        <a href="/rules">Rules</a>
        <a href="/faq">FAQ</a>
        <button className="signup-btn" onClick={handleSignup}>
          Sign Up
        </button>
      </nav>
    </header>
  );
}