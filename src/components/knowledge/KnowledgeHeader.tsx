import Link from 'next/link';
import styles from './KnowledgeHeader.module.css';

export function KnowledgeHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.backLink}>
          ← Back to experience
        </Link>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Knowledge & Pipeline</h1>
          <p className={styles.subtitle}>
            Read-only transparency view: explore grounded website source sections, registered media assets, and test questions through the real pipeline trace.
          </p>
        </div>
      </div>
    </header>
  );
}

