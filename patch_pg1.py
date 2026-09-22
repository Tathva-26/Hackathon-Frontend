import re

with open("src/app/components/pg1.jsx", "r") as f:
    content = f.read()

# Add SVG icons and MILESTONES array
icons_code = """
// ---- Milestone icons ----
function IconUserPlus() {
  return (
    <svg className={styles.milestoneIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

function IconCard() {
  return (
    <svg className={styles.milestoneIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function IconTerminal() {
  return (
    <svg className={styles.milestoneIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <polyline points="7 9 10 12 7 15" />
      <line x1="12" y1="15" x2="17" y2="15" />
    </svg>
  );
}

function IconClipboardCheck() {
  return (
    <svg className={styles.milestoneIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <polyline points="9 14 11 16 15 11" />
    </svg>
  );
}

function IconTrophy() {
  return (
    <svg className={styles.milestoneIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H8a1 1 0 0 0-1 1v1h10v-1a1 1 0 0 0-1-1h-1a1 1 0 0 1-1-1v-2.34" />
      <path d="M6 4h12a2 2 0 0 1 2 2v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

const MILESTONES = [
  { date: "SEP 15", phase: "PHASE 01", title: "Pre-Registration", desc: "Portal Opens", Icon: IconUserPlus },
  { date: "SEP 20", phase: "PHASE 02", title: "Registration & Fee", desc: "Payment Window", Icon: IconCard },
  { date: "SEP 26", phase: "PHASE 03", title: "Online Prelims", desc: "Round 1", Icon: IconTerminal },
  { date: "SEP 30", phase: "PHASE 04", title: "Prelims Result", desc: "Shortlist Published", Icon: IconClipboardCheck },
  { date: "OCT 09", phase: "PHASE 05", title: "Final Round", desc: "@ NIT Calicut Campus", Icon: IconTrophy },
];
"""

content = content.replace("export default function Pg1() {", icons_code + "\nexport default function Pg1() {")

# Add timelineCardRef
content = content.replace("const aboutCardRef = useRef(null);", "const aboutCardRef = useRef(null);\n  const timelineCardRef = useRef(null);")

# Add scroll to timeline for SEE SCHEDULE
def_see_sched = """
  const handleSeeSchedule = () => {
    if (spacerRef.current) {
      const total = spacerRef.current.offsetHeight - window.innerHeight;
      window.scrollTo({ top: spacerRef.current.offsetTop + total * 0.5, behavior: 'smooth' });
    }
  };
"""
content = content.replace("export default function Pg1() {", "export default function Pg1() {\n" + def_see_sched)
content = content.replace("<button className={styles.button}>SEE SCHEDULE</button>", "<button className={styles.button} onClick={handleSeeSchedule}>SEE SCHEDULE</button>")

# Update 3 phases in handleScroll
new_phases = """
      const holdPoint1 = 0.3333 * total;
      const holdPoint2 = 0.6666 * total;

      // Trap going DOWN at 33%
      if (scrolled >= holdPoint1 && lastScrolled < holdPoint1 && gestureActive) {
        isLocked = true;
        setTimeout(() => { isLocked = false; }, 800);
        if (typeof window !== 'undefined' && window.innerWidth <= 640) document.body.style.overflow = 'hidden';
        window.scrollTo({ top: window.scrollY + rect.top + holdPoint1 });
      }
      // Trap going UP at 33%
      if (scrolled <= holdPoint1 && lastScrolled > holdPoint1 && gestureActive) {
        isLocked = true;
        setTimeout(() => { isLocked = false; }, 800);
        if (typeof window !== 'undefined' && window.innerWidth <= 640) document.body.style.overflow = 'hidden';
        window.scrollTo({ top: window.scrollY + rect.top + holdPoint1 });
      }

      // Trap going DOWN at 66%
      if (scrolled >= holdPoint2 && lastScrolled < holdPoint2 && gestureActive) {
        isLocked = true;
        setTimeout(() => { isLocked = false; }, 800);
        if (typeof window !== 'undefined' && window.innerWidth <= 640) document.body.style.overflow = 'hidden';
        window.scrollTo({ top: window.scrollY + rect.top + holdPoint2 });
      }
      // Trap going UP at 66%
      if (scrolled <= holdPoint2 && lastScrolled > holdPoint2 && gestureActive) {
        isLocked = true;
        setTimeout(() => { isLocked = false; }, 800);
        if (typeof window !== 'undefined' && window.innerWidth <= 640) document.body.style.overflow = 'hidden';
        window.scrollTo({ top: window.scrollY + rect.top + holdPoint2 });
      }

      lastScrolled = scrolled;

      const progress = clamp(total > 0 ? scrolled / total : 0, 0, 1);
      const progress1 = clamp(progress / 0.3333, 0, 1);
      const progress2 = clamp((progress - 0.3333) / 0.3333, 0, 1);
      const progress3 = clamp((progress - 0.6666) / 0.3333, 0, 1);
"""

# replace from `const holdPoint` to `const progress2 = clamp((progress - 0.50) / 0.50, 0, 1);`
old_phases_regex = re.compile(r"const holdPoint = 0\.50 \* total;.*?const progress2 = clamp\(\(progress - 0\.50\) / 0\.50, 0, 1\);", re.DOTALL)
content = old_phases_regex.sub(new_phases.strip(), content)

# update card visibility
new_card_visibility = """
      // About card
      const aboutProgress = clamp((progress1 - 0.4) / 0.6, 0, 1);
      const aboutFadeOut = clamp(progress2 / 0.4, 0, 1);
      const aboutFinalOpacity = aboutProgress - aboutFadeOut;

      if (aboutCardRef.current) {
        aboutCardRef.current.style.opacity = aboutFinalOpacity;
        aboutCardRef.current.style.transform = `translateY(${50 * (1 - aboutProgress) + 50 * aboutFadeOut}px) scale(${0.95 + 0.05 * aboutProgress - 0.05 * aboutFadeOut})`;
        aboutCardRef.current.style.pointerEvents = aboutFinalOpacity > 0.5 ? "auto" : "none";
      }

      // Timeline card
      const timelineIn = clamp((progress2 - 0.4) / 0.6, 0, 1);
      const timelineFadeOut = clamp(progress3 / 0.4, 0, 1);
      const timelineFinalOpacity = timelineIn - timelineFadeOut;
      if (timelineCardRef.current) {
        timelineCardRef.current.style.opacity = timelineFinalOpacity;
        timelineCardRef.current.style.transform = `translateY(${50 * (1 - timelineIn) + 50 * timelineFadeOut}px) scale(${0.95 + 0.05 * timelineIn - 0.05 * timelineFadeOut})`;
        timelineCardRef.current.style.pointerEvents = timelineFinalOpacity > 0.5 ? "auto" : "none";
      }

      // Sponsors card
      const sponsorsIn = clamp((progress3 - 0.4) / 0.6, 0, 1);
      if (sponsorsCardRef.current) {
        sponsorsCardRef.current.style.opacity = sponsorsIn;
        sponsorsCardRef.current.style.transform = `translateY(${50 * (1 - sponsorsIn)}px) scale(${0.95 + 0.05 * sponsorsIn})`;
        sponsorsCardRef.current.style.pointerEvents = sponsorsIn > 0.5 ? "auto" : "none";
      }
"""

old_card_regex = re.compile(r"const aboutProgress = clamp\(\(progress1 - 0\.4\) / 0\.6, 0, 1\);.*?sponsorsCardRef\.current\.style\.pointerEvents = sponsorsIn > 0\.5 \? \"auto\" : \"none\";\n      }", re.DOTALL)
content = old_card_regex.sub(new_card_visibility.strip(), content)

timeline_html = """
          {/* ---------- TIMELINE & MILESTONES ---------- */}
          <div className={`${styles.aboutWrap} mb-25 lg:mt-15`}>
            <div
              className={`${styles.card} ${styles.timelineCardWrapper}`}
              ref={timelineCardRef}
              style={{ opacity: 0, pointerEvents: "none" }}
            >
              <span className={styles.pill}>TIMELINE &amp; MILESTONES</span>
              <p className={styles.timelineIntro}>
                // Roadmap to Innovation • Tathva &apos;26 Flagship Hackathon
              </p>
              <div className={styles.timeline}>
                <div className={styles.timelineLine}></div>
                {MILESTONES.map(({ date, phase, title, desc, Icon }) => (
                  <div className={styles.milestone} key={phase}>
                    <div className={styles.milestoneDate}>{date}</div>
                    <div className={styles.milestoneNode}>
                      <Icon />
                    </div>
                    <span className={styles.milestonePhase}>{phase}</span>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
"""

content = content.replace("{/* ---------- SPONSORS ---------- */}", timeline_html + "\n          {/* ---------- SPONSORS ---------- */}")

with open("src/app/components/pg1.jsx", "w") as f:
    f.write(content)

print("pg1.jsx updated")

