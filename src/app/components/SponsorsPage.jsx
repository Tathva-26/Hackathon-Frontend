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
      </div>
    </main>
  );
}
