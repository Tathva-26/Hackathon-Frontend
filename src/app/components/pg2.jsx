import styles from "./pg2.module.css";

export default function Pg2() {
  return (
    <section className={styles.section}>
      <img src="/assets/atom.png" className={styles.decorTopRight} alt="" />
      <img src="/assets/whatsapp-graphic.jpg" className={styles.decorBottom} alt="" />

      <a href="/" className={styles.logo} aria-label="Tathva '26 home">
        <img src="/assets/tathva.png" alt="Tathva '26 NIT Calicut" />
      </a>

      <div className={styles.card}>
        <span className={styles.pill}>ABOUT</span>

        <p className={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
          dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
          mollit anim id est laborum.
        </p>

        <div className={styles.buttonRow}>
          <button className={styles.button}>REGISTER NOW</button>
          <button className={styles.button}>SEE SCHEDULE</button>
        </div>
      </div>
    </section>
  );
}