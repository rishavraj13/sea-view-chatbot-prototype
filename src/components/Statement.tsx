import styles from './Statement.module.css';

export function Statement() {
  return (
    <section className={styles.section} aria-label="Experience overview">
      <div className={styles.hairline} aria-hidden="true" />
      <h2 className={styles.heading}>
        The <span className="serif-italic">same</span> jump in every package.
      </h2>
      <p className={styles.subline}>
        Choose no cameras, instructor video and photos, or a personal cameraman.
      </p>
    </section>
  );
}

