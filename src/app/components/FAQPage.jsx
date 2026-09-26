"use client";

import { useState } from "react";

const faqData = [
  {
    id: 1,
    question: "Who can participate?",
    answer:
      "TatHack ’26 is open to all college students across India.",
  },
  {
    id: 2,
    question: "What is the team size?",
    answer:
      "Teams can have 1–4 participants.",
  },
  {
    id: 3,
    question: "What is the format of the Preliminary Round?",
    answer:
      "Teams will choose one of the provided repositories, then debug the existing code and add features as instructed.",
  },
  {
    id: 4,
    question: "Where and when is the hackathon conducted?",
    answer:
      "The Preliminary Round is fully online, while the Grand Finale will be held at NIT Calicut during Tathva ’26 on 9-10 October 2026.",
  },
  {
    id: 5,
    question: "What is the registration fee?",
    answer:
      "The registration fee is ₹150 per participant.",
  },
  {
    id: 6,
    question: "Can we use AI to generate our entire project?",
    answer:
      "AI tools may assist with development, but the project must be genuinely developed and understood by the participating team. Participants should not submit a project that they cannot explain or demonstrate themselves.",
  },
];

export default function FAQPage() {
  const [openId, setOpenId] = useState(null);

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

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

      {/* Main FAQs Container */}
      <div className="faq-page-wrapper">
        {/* Top Center FAQS Badge */}
        <div className="faq-top-badge">
          <span>FAQS</span>
        </div>

        {/* Scrollable FAQ Accordion List (Scrollbar visuals hidden to prevent double scrollbars) */}
        <div className="faq-list-container">
          {faqData.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`faq-item-wrapper ${isOpen ? "open" : ""}`}
              >
                {/* Top White Pill Header */}
                <div
                  className="faq-pill-header"
                  onClick={() => toggleFaq(item.id)}
                >
                  <h3 className="faq-question-text">{item.question}</h3>
                  <div className="faq-arrow-btn">
                    {isOpen ? "↑" : "↓"}
                  </div>
                </div>

                {/* Dark Answer Box underneath when opened */}
                {isOpen && (
                  <div className="faq-dark-answer-box">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
