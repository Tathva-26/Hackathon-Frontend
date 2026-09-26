"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import { formatDay, rupees } from "./format";

const WIDTH = 600;
const HEIGHT = 160;

// Last-30-days bar chart. "activity" shows registrations started next to teams
// paid per day; "revenue" shows money collected per day. Hovering a day shows
// its numbers in the readout above the chart.
export default function TrendChart({ data }) {
  const [mode, setMode] = useState("activity");
  const [hovered, setHovered] = useState(null);

  const totals = data.reduce(
    (sum, day) => ({
      registrations: sum.registrations + day.registrations,
      paid: sum.paid + day.paid,
      revenuePaise: sum.revenuePaise + day.revenuePaise,
    }),
    { registrations: 0, paid: 0, revenuePaise: 0 },
  );
  const active = hovered === null ? null : data[hovered];
  const shown = active || totals;

  const max =
    mode === "activity"
      ? Math.max(1, ...data.map((day) => Math.max(day.registrations, day.paid)))
      : Math.max(1, ...data.map((day) => day.revenuePaise));
  const slot = WIDTH / data.length;
  const barHeight = (value) => (value / max) * (HEIGHT - 6);

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <span className={styles.eyebrow}>LAST 30 DAYS</span>
          <p className={styles.readout}>
            <b>{active ? formatDay(active.date) : "All 30 days"}</b>
            {mode === "activity" ? (
              <>
                <span>
                  <i className={styles.keyInk} /> {shown.registrations} registrations started
                </span>
                <span>
                  <i className={styles.keyLime} /> {shown.paid} teams paid
                </span>
              </>
            ) : (
              <span>
                <i className={styles.keyYellow} /> {rupees(shown.revenuePaise)} collected
              </span>
            )}
          </p>
        </div>
        <div className={styles.segmented}>
          <button className={mode === "activity" ? styles.segmentOn : ""} onClick={() => setMode("activity")}>
            Activity
          </button>
          <button className={mode === "revenue" ? styles.segmentOn : ""} onClick={() => setMode("revenue")}>
            Revenue
          </button>
        </div>
      </div>

      <div className={styles.chart} onMouseLeave={() => setHovered(null)}>
        <span className={styles.chartMax}>{mode === "activity" ? max : rupees(max)}</span>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" role="img" aria-label="Daily trend">
          <line x1="0" x2={WIDTH} y1={HEIGHT - 0.5} y2={HEIGHT - 0.5} className={styles.chartAxis} />
          {data.map((day, index) => {
            const x = index * slot;
            const values =
              mode === "activity"
                ? [
                    { value: day.registrations, className: styles.barInk },
                    { value: day.paid, className: styles.barLime },
                  ]
                : [{ value: day.revenuePaise, className: styles.barYellow }];
            const barWidth = (slot * 0.7) / values.length;
            return (
              <g key={day.date} onMouseEnter={() => setHovered(index)}>
                <rect x={x} y="0" width={slot} height={HEIGHT} className={hovered === index ? styles.barHover : styles.barHit} />
                {values.map((bar, barIndex) => (
                  <rect
                    key={barIndex}
                    x={x + slot * 0.15 + barIndex * barWidth}
                    y={HEIGHT - barHeight(bar.value)}
                    width={Math.max(barWidth - 1, 1)}
                    height={barHeight(bar.value)}
                    className={bar.className}
                  />
                ))}
              </g>
            );
          })}
        </svg>
        <div className={styles.chartDates}>
          <span>{formatDay(data[0].date)}</span>
          <span>{formatDay(data[Math.floor(data.length / 2)].date)}</span>
          <span>Today</span>
        </div>
      </div>
    </section>
  );
}
