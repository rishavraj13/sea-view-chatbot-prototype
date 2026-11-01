import Link from 'next/link';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Greedy Adventures Sea View Skydiving">
          <span>Sea View Skydiving</span>
          <span className={styles.brandTag}>Pattaya</span>
        </Link>
        <nav className={styles.nav} aria-label="Main navigation">
          <ul className={styles.navLinks}>
            <li>
              <a href="#packages" className={styles.navLink}>
                Packages
              </a>
            </li>
            <li>
              <a href="#plan" className={styles.navLink}>
                The plan
              </a>
            </li>
            <li>
              <a href="#faq" className={styles.navLink}>
                Good to know
              </a>
            </li>
            <li>
              <Link href="/knowledge" className={styles.navLink}>
                Knowledge
              </Link>
            </li>
          </ul>
          <a href="#packages" className={styles.actionPill}>
            Choose package
          </a>
        </nav>
      </div>
    </header>
  );
}

