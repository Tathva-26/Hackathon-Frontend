"use client";

export default function RulesPage() {
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

      {/* Main Rules Card Frame */}
      <div className="prize-card-container">
        {/* Top Center Rules Badge */}
        <div className="prize-pill-badge">
          <span>RULES</span>
        </div>



        {/* Rules Content */}
        <div className="sponsors-content-wrapper">
          <p className="sponsors-subtext">HACKATHON GUIDELINES</p>
          <div className="rules-list">
            <div className="rule-item">
              <span className="rule-num">01</span>
              <p>Teams must consist of 2 to 4 members.</p>
            </div>
            <div className="rule-item">
              <span className="rule-num">02</span>
              <p>All code must be written during the hackathon period.</p>
            </div>
            <div className="rule-item">
              <span className="rule-num">03</span>
              <p>Plagiarism will result in immediate disqualification.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
