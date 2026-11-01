import { HERO_FACTS, SITE_METADATA } from '@/content';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <p className={styles.kicker}>{SITE_METADATA.kicker}</p>
      <h1 id="hero-heading" className={styles.heading}>
        <span className={styles.headingPrimary}>Sea View</span>
        <span className="echo-word">{SITE_METADATA.echoWord}</span>
      </h1>
      <p className={styles.subline}>{SITE_METADATA.subline}</p>
      <div className={styles.actionRow}>
        <a href="#packages" className={styles.primaryPill}>
          Choose package
        </a>
        <span className={styles.priceTag}>{SITE_METADATA.fromPrice}</span>
        <a
          href={SITE_METADATA.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.videoLink}
        >
          Watch the jump
        </a>
      </div>
      <div className={styles.factRow}>
        {HERO_FACTS.map((fact) => (
          <div key={fact.label} className={styles.factItem}>
            <span className={styles.factValue}>{fact.value}</span>
            <span className={styles.factLabel}>{fact.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

