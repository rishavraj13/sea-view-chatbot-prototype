import { HEADER_UI, HERO_FACTS, HERO_UI, SITE_METADATA } from '@/content';
import styles from './HeroIntro.module.css';

export function HeroIntro() {
  return (
    <section className={styles.intro} aria-label={HERO_UI.intro}>
      <div className={styles.actions}>
        <a href="#packages" className={styles.primary}>
          {HEADER_UI.action}
        </a>
        <span>{SITE_METADATA.fromPrice}</span>
        <a
          href={SITE_METADATA.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.video}
        >
          {HERO_UI.watch}
        </a>
      </div>
      <div className={styles.facts}>
        {HERO_FACTS.map((fact) => (
          <div key={fact.label}>
            <span className={styles.value}>{fact.value}</span>
            <span className={styles.label}>{fact.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
