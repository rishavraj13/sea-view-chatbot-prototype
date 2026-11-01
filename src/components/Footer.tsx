import Link from 'next/link';
import { SITE_METADATA, FOOTER_UI } from '@/content';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.column}>
          <span className={styles.brandName}>{FOOTER_UI.brand}</span>
          <p className={styles.summaryText}>{FOOTER_UI.summary}</p>
          <p className={styles.prototypeNote}>{FOOTER_UI.prototype}</p>
        </div>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>{FOOTER_UI.navigation}</h3>
          <ul className={styles.linksList}>
            <li>
              <Link href="/#packages" className={styles.footerLink}>
                {FOOTER_UI.packages}
              </Link>
            </li>
            <li>
              <Link href="/#plan" className={styles.footerLink}>
                {FOOTER_UI.plan}
              </Link>
            </li>
            <li>
              <Link href="/#faq" className={styles.footerLink}>
                {FOOTER_UI.faq}
              </Link>
            </li>
            <li>
              <Link href="/knowledge" className={styles.footerLink}>
                {FOOTER_UI.knowledge}
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>{FOOTER_UI.demos}</h3>
          <ul className={styles.linksList}>
            <li>
              <a
                href={SITE_METADATA.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                {FOOTER_UI.live}
              </a>
            </li>
            <li>
              <a
                href={SITE_METADATA.mockDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                {FOOTER_UI.mock}
              </a>
            </li>
            <li>
              <Link href="/knowledge" className={styles.footerLink}>
                {FOOTER_UI.knowledge}
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>{FOOTER_UI.credits}</h3>
          <ul className={styles.linksList}>
            <li>
              <span className={styles.summaryText}>
                {FOOTER_UI.photography}
              </span>
            </li>
            <li>
              <a
                href={SITE_METADATA.contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                {FOOTER_UI.contact}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>{FOOTER_UI.copyright}</p>
        <p>{FOOTER_UI.design}</p>
      </div>
    </footer>
  );
}
