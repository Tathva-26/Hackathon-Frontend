"use client";

export default function Navbar() {
  const handleSignup = () => {
    window.location.href = "#register";
  };

  return (
    <header className="navbar">
      

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