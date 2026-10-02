"use client";

import Link from "next/link";

export default function SponsorsPage() {
  return (
    <main className="prize-page page-transition">
      {/* Background grid */}
      <div className="grid"></div>

      {/* Decorative background graphics matching landing page */}
      <img
        src="/assets/atom.png"
        className="decor decor-top-right"
        alt=""
      />
      <img
        src="/assets/whatsapp-graphic.jpg"
        className="decor decor-bottom"
        alt=""
      />

      {/* Main Sponsors Card Frame */}
      <div className="prize-card-container">
        {/* Top Center Sponsors Badge */}
        <div className="prize-pill-badge">
          <span>SPONSORS</span>
        </div>



        {/* Sponsors Content */}
        <div className="sponsors-content-wrapper">
          <div className="sponsors-placeholder-grid">
            <div className="sponsor-box">
              <span className="sponsor-badge-tag">TITLE SPONSOR</span>
              <div className="sponsor-logo-tile">
                <span className="brototype-logo">
                  <img src="/assets/Brototype-Black%20Registered.png" alt="Brototype" />
                </span>
              </div>
              <div className="sponsor-slot">BROTOTYPE</div>
            </div>
            <div className="sponsor-box">
              <span className="sponsor-badge-tag">COMMUNITY SPONSOR</span>
              <div className="sponsor-logo-tile">
                <img
                  src="/assets/CP.png"
                  className="sponsor-logo-img"
                  alt="CP Hub, NIT Calicut"
                />
              </div>
              <div className="sponsor-slot">CP HUB, NIT CALICUT</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
