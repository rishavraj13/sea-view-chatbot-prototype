'use client';

import Image from 'next/image';
import { HERO_IMAGE, HERO_UI, SITE_METADATA } from '@/content';
import { useScrollProgress } from './scroll/useScrollProgress';
import styles from './Hero.module.css';

export function Hero() {
  const ref = useScrollProgress<HTMLElement>('pin');
  return (
    <section
      ref={ref}
      className={styles.hero}
      aria-labelledby="hero-heading"
      data-scroll-hero
    >
      <div className={styles.stage} data-hero-stage>
        <div className={styles.photo} data-hero-photo>
          <Image
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            fill
            preload
            sizes="100vw"
          />
        </div>
        <div className={styles.scrim} aria-hidden="true" />
        <div
          className={`${styles.overlay} ${styles.inkOverlay}`}
          aria-hidden="true"
          data-hero-overlay
        />
        <div
          className={`${styles.overlay} ${styles.emberOverlay}`}
          aria-hidden="true"
          data-hero-overlay
        />
        <i
          className={`${styles.dot} ${styles.dotFirst}`}
          aria-hidden="true"
          data-hero-dot
        />
        <i
          className={`${styles.dot} ${styles.dotLast}`}
          aria-hidden="true"
          data-hero-dot
        />
        <div
          className={`${styles.panel} ${styles.panelFirst}`}
          aria-hidden="true"
          data-hero-panel
        />
        <div
          className={`${styles.panel} ${styles.panelLast}`}
          aria-hidden="true"
          data-hero-panel
        />
        <div className={styles.copy}>
          <p className={styles.kicker}>{SITE_METADATA.kicker}</p>
          <h1 id="hero-heading" className={styles.heading}>
            <span>{HERO_UI.firstWord}</span> <span>{HERO_UI.lastWord}</span>
          </h1>
          <p className={styles.subline}>{SITE_METADATA.subline}</p>
        </div>
      </div>
    </section>
  );
}
