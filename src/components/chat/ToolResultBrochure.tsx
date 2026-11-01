import type { BrochureResult } from './types';
import { CHAT_COPY } from '@/content';
import styles from './ToolResultBrochure.module.css';

interface ToolResultBrochureProps {
  readonly result: BrochureResult;
}

export function ToolResultBrochure({ result }: ToolResultBrochureProps) {
  return (
    <div className={styles.card} role="region" aria-label={CHAT_COPY.brochure}>
      <div className={styles.headerRow}>
        <span className={styles.pdfBadge} aria-hidden="true">
          {CHAT_COPY.pdf}
        </span>
        <div className={styles.titleArea}>
          <span className={styles.title}>{result.title}</span>
          {result.isDemo && (
            <span className={styles.demoBadge}>{CHAT_COPY.demo}</span>
          )}
        </div>
      </div>
      <div className={styles.buttonRow}>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.button} ${styles.primaryButton}`}
        >
          {CHAT_COPY.open}
        </a>
        <a
          href={result.url}
          download
          rel="noopener noreferrer"
          className={styles.button}
        >
          {CHAT_COPY.download}
        </a>
      </div>
    </div>
  );
}
