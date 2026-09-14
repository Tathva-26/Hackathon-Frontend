"use client";

import { useState } from "react";

const faqData = [
  {
    id: 1,
    question: "What is TatHack?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    id: 2,
    question: "What is TatHack?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    id: 3,
    question: "What is TatHack?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: 4,
    question: "What is TatHack?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: 5,
    question: "What is TatHack?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
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
