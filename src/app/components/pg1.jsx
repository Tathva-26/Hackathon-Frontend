"use client";

export default function Pg1() {
  return (
    <main className="hero page-transition">
      <div className="grid"></div>

      <img src="/assets/hand-left.png" className="decor decor-left" alt="" />
      <img src="/assets/hand-right.png" className="decor decor-right" alt="" />
      <img src="/assets/atom.png" className="decor decor-top-right" alt="" />
      <img src="/assets/whatsapp-graphic.jpg" className="decor decor-bottom" alt="" />

      <header className="navbar">
        <a href="#" className="logo" aria-label="Tathva '26 home">
          <img src="/assets/tathva.png" alt="Tathva '26 NIT Calicut" />
        </a>
      </header>

      <section className="hero-content">
        <p className="presents">PRESENTS</p>

        <h1 className="title">
          <span>TatHack</span>
          <span>&apos;26</span>
        </h1>

        <p className="date">October 9th - 10th</p>
      </section>
    </main>
  );
}