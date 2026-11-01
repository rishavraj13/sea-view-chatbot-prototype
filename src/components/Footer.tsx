import Link from 'next/link';
import { SITE_METADATA } from '@/content';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Col 1: Brand summary */}
        <div className={styles.column}>
          <span className={styles.brandName}>Greedy Adventures</span>
          <p className={styles.summaryText}>
            Tandem skydiving over Pattaya, Thailand with sea views from 13,000
            ft.
          </p>
          <p className={styles.prototypeNote}>
            Assignment prototype. No real bookings or payments.
          </p>
        </div>

        {/* Col 2: Navigation */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Navigation</h3>
          <ul className={styles.linksList}>
            <li>
              <Link href="/#packages" className={styles.footerLink}>
                Packages
              </Link>
            </li>
            <li>
              <Link href="/#plan" className={styles.footerLink}>
                The plan
              </Link>
            </li>
            <li>
              <Link href="/#faq" className={styles.footerLink}>
                Good to know
              </Link>
            </li>
            <li>
              <Link href="/knowledge" className={styles.footerLink}>
                Knowledge view
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Demos */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Demos</h3>
          <ul className={styles.linksList}>
            <li>
              <a
                href={SITE_METADATA.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                Live production ↗
              </a>
            </li>
            <li>
              <a
                href={SITE_METADATA.mockDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                Mock demonstration ↗
              </a>
            </li>
            <li>
              <Link href="/knowledge" className={styles.footerLink}>
                Knowledge view
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Credits & Contact */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Credits</h3>
          <ul className={styles.linksList}>
            <li>
              <span className={styles.summaryText}>
                Photography and content © Greedy Adventures
              </span>
            </li>
            <li>
              <a
                href={SITE_METADATA.contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                Contact Greedy Adventures ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>© Greedy Adventures. All rights reserved.</p>
        <p>Swiss echo design prototype · Pattaya Sea View</p>
      </div>
    </footer>
  );
}
