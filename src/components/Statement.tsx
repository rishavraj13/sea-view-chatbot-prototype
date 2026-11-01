import styles from './Statement.module.css';

export function Statement() {
  return (
    <section className={styles.section} aria-label={STATEMENT_UI.label}>
      <div className={styles.hairline} aria-hidden="true" />
      <h2 className={styles.heading}>
        <span className="serif-italic">{STATEMENT_UI.emphasis}</span>
        {STATEMENT_UI.heading.slice(STATEMENT_UI.emphasis.length)}
      </h2>
    </section>
  );
}

import { STATEMENT_UI } from '@/content';
