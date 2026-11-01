import Link from 'next/link';
import { KNOWLEDGE_UI } from '@/content';
import styles from './KnowledgeHeader.module.css';

export function KnowledgeHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.backLink}>
          {KNOWLEDGE_UI.backLink}
        </Link>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>{KNOWLEDGE_UI.title}</h1>
          <p className={styles.subtitle}>{KNOWLEDGE_UI.subtitle}</p>
        </div>
      </div>
    </header>
  );
}

