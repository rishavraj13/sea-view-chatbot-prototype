import Link from 'next/link';
import { HEADER_UI } from '@/content';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={HEADER_UI.brand}>
          <span>{HEADER_UI.brand}</span>
        </Link>
        <nav className={styles.nav} aria-label={HEADER_UI.navigationLabel}>
          <ul className={styles.navLinks}>
            {HEADER_UI.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.navLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <a href={HEADER_UI.actionHref} className={styles.actionPill}>
            {HEADER_UI.action}
          </a>
        </nav>
      </div>
    </header>
  );
}

