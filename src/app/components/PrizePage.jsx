"use client";

import Link from "next/link";

export default function PrizePage() {
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

      {/* Main Prize Card Frame */}
      <div className="prize-card-container">
        {/* Top Center Prize Badge */}
        <div className="prize-pill-badge">
          <span>PRIZES</span>
        </div>

        {/* Top Right Circular Text Ring & Diamond Star */}
        <div className="prize-ring-wrapper">
          <img
            src="/assets/prizering.png"
            className="prize-ring-img"
            alt="Prize Ring"
          />
          <img
            src="/assets/Vector.png"
            className="prize-vector-star"
            alt="Star"
          />
        </div>

        {/* Main 1st, 2nd, 3rd Prize Podiums Graphic */}
        <div className="prize-podium-wrapper">
          <img
            src="/assets/prize.png"
            className="prize-podium-img"
            alt="1st, 2nd, 3rd Prize Money Podium"
          />
        </div>

        {/* Bottom Left Info Text */}
        <div className="prize-bottom-info">
          <h3 className="prize-bottom-title">ANYTHING ELSE?</h3>
          <p className="prize-bottom-desc">
            ABSOLUTELY! EVERY PARTICIPANT RECEIVES A CERTIFICATE! AND THE
            SELECTED PARTICIPANTS TAKE HOME EXCLUSIVE GOODIES! Participate. Get
            recognized. Get rewarded.
          </p>
        </div>
      </div>
    </main>
  );
}
