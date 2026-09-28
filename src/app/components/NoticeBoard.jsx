"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./register.module.css";
import { fetchAnnouncements } from "../lib/auth";

// Bodies longer than this get cut to a few lines with "Read more".
const LONG_BODY_CHARS = 320;
const LONG_BODY_LINES = 5;
// Coming back to the tab refetches, at most this often.
const REFRESH_AFTER_MS = 60 * 1000;
const LAST_SEEN_KEY_PREFIX = "tathack:notices-last-seen:";
// Leftover scroll (px) below which the list counts as scrolled to the end.
const END_SLACK_PX = 4;

const URL_PATTERN = /(https?:\/\/[^\s<]+)/g;
const TRAILING_PUNCTUATION = /[.,!?;:)\]'"]+$/;

// Newest notice timestamp this browser had shown for the registration, used
// for the NEW badges. Storage can be unavailable (private mode, blocked site
// data); every notice then counts as new.
function readLastSeen(registrationId) {
  try {
    return window.localStorage.getItem(LAST_SEEN_KEY_PREFIX + registrationId) || "";
  } catch {
    return "";
  }
}

function writeLastSeen(registrationId, value) {
  try {
    window.localStorage.setItem(LAST_SEEN_KEY_PREFIX + registrationId, value);
  } catch {
    // Best-effort only.
  }
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// "26 SEP · 14:30" in India time, the event's timezone. The month is mapped by
// hand as short month names differ between browsers ("Sep" / "Sept").
function formatStamp(iso) {
  if (!iso) return "";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "Asia/Kolkata",
    })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  );
  return `${parts.day} ${MONTHS[Number(parts.month) - 1]} · ${parts.hour}:${parts.minute}`;
}

// Notices are plain text: keep them as text (React escapes it) and only turn
// http(s) URLs into links, so a submission link can be clicked.
function Linkified({ text }) {
  return text.split(URL_PATTERN).map((part, index) => {
    if (index % 2 === 0) return part;
    const trailing = part.match(TRAILING_PUNCTUATION)?.[0] || "";
    const url = trailing ? part.slice(0, -trailing.length) : part;
    return (
      <span key={index}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
        {trailing}
      </span>
    );
  });
}

function Notice({ notice, number, isNew }) {
  const [expanded, setExpanded] = useState(false);
  const isLong =
    notice.content.length > LONG_BODY_CHARS ||
    notice.content.split("\n").length > LONG_BODY_LINES;

  return (
    <li className={styles.notice}>
      <p className={styles.noticeStamp}>
        <span>#{String(number).padStart(2, "0")}</span>
        <span>{formatStamp(notice.publishedAt)}</span>
        {isNew && <b className={styles.newBadge}>NEW</b>}
      </p>
      <h3 className={styles.noticeTitle}>{notice.title}</h3>
      <p className={`${styles.noticeBody} ${isLong && !expanded ? styles.noticeClamped : ""}`}>
        <Linkified text={notice.content} />
      </p>
      {isLong && (
        <button
          type="button"
          className={styles.textButton}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "SHOW LESS" : "READ MORE"}
        </button>
      )}
    </li>
  );
}

// Notice board on the paid team's /register dashboard. Admins post from the
// admin panel's Announcements tab; the backend only serves them to leaders
// of paid teams, as they can carry participant-only links.
export default function NoticeBoard({ registrationId }) {
  const [state, setState] = useState({ status: "loading", items: [] });
  // Captured once per visit so NEW badges stay put while the page is open,
  // even though the stored value moves on as soon as notices load.
  const [lastSeen] = useState(() => readLastSeen(registrationId));
  const lastFetchRef = useRef(0);
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  // "More below" prompt: shown while the list can scroll further down, with
  // the number of notices that haven't come into view yet.
  const [more, setMore] = useState({ show: false, count: 0 });

  const load = useCallback(() => {
    lastFetchRef.current = Date.now();
    return fetchAnnouncements()
      .then((body) => {
        const items = Array.isArray(body?.data) ? body.data : [];
        setState({ status: "ready", items });
        if (items[0]?.publishedAt) writeLastSeen(registrationId, items[0].publishedAt);
      })
      .catch(() => {
        // Keep showing notices that already loaded; only an empty board
        // switches to the error message.
        setState((prev) => (prev.status === "ready" ? prev : { status: "error", items: [] }));
      });
  }, [registrationId]);

  useEffect(() => {
    load();
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastFetchRef.current > REFRESH_AFTER_MS) {
        load();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  useEffect(() => {
    const scroller = scrollRef.current;
    const update = () => {
      const remaining = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
      if (remaining <= END_SLACK_PX) {
        setMore((prev) => (prev.show ? { show: false, count: 0 } : prev));
        return;
      }
      const bottom = scroller.getBoundingClientRect().bottom;
      const count = [...scroller.querySelectorAll("li")].filter(
        (li) => li.getBoundingClientRect().top > bottom - 8,
      ).length;
      setMore((prev) => (prev.show && prev.count === count ? prev : { show: true, count }));
    };
    // The observer also runs once on start, and again whenever notices load,
    // a notice is expanded, or the board resizes.
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    observer.observe(contentRef.current);
    scroller.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      scroller.removeEventListener("scroll", update);
    };
  }, []);

  const scrollDown = () => {
    const scroller = scrollRef.current;
    scroller.scrollBy({ top: scroller.clientHeight * 0.8, behavior: "smooth" });
  };

  const retry = () => {
    setState({ status: "loading", items: [] });
    load();
  };

  const { status, items } = state;
  const countLabel =
    status === "loading"
      ? "LOADING"
      : status === "error"
        ? "OFFLINE"
        : `${String(items.length).padStart(2, "0")} POST${items.length === 1 ? "" : "S"}`;

  return (
    <section className={styles.noticeBoard} aria-labelledby="notice-board-title">
      <p className={styles.formHeader}>
        <span id="notice-board-title">NOTICE BOARD</span>
        <b>{countLabel}</b>
      </p>

      {/* Fixed-size board: the header stays put and the notices scroll
          inside it. Focusable so the list can be scrolled by keyboard. */}
      <div ref={scrollRef} className={styles.noticeScroll} tabIndex={0} aria-label="Notices">
        <div ref={contentRef}>
          {status === "loading" && <p className={styles.noticeEmpty}>LOADING NOTICES...</p>}

          {status === "error" && (
            <div className={styles.noticeEmpty}>
              <p>COULDN&apos;T LOAD NOTICES.</p>
              <button type="button" className={styles.textButton} onClick={retry}>
                TRY AGAIN ↻
              </button>
            </div>
          )}

          {status === "ready" && items.length === 0 && (
            <p className={styles.noticeEmpty}>
              NO NOTICES YET.
              <br />
              CHECK BACK CLOSER TO THE EVENT.
            </p>
          )}

          {status === "ready" && items.length > 0 && (
            <ol className={styles.noticeList}>
              {items.map((notice, index) => (
                <Notice
                  key={notice.id}
                  notice={notice}
                  number={items.length - index}
                  isNew={!lastSeen || (notice.publishedAt || "") > lastSeen}
                />
              ))}
            </ol>
          )}
        </div>
      </div>

      {more.show && (
        <div className={styles.noticeMoreHint}>
          <button type="button" onClick={scrollDown}>
            <span aria-hidden="true">↓</span>
            {more.count > 0
              ? `${more.count} MORE NOTICE${more.count === 1 ? "" : "S"}`
              : "SCROLL FOR MORE"}
          </button>
        </div>
      )}
    </section>
  );
}
