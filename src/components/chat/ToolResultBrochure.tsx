import type { BrochureResult } from './types';
import styles from './ToolResultBrochure.module.css';

interface ToolResultBrochureProps {
  readonly result: BrochureResult;
}

export function ToolResultBrochure({ result }: ToolResultBrochureProps) {
  return (
    <div className={styles.card} role="region" aria-label="Brochure document">
      <div className={styles.headerRow}>
        <span className={styles.pdfBadge} aria-hidden="true">
          PDF
        </span>
        <div className={styles.titleArea}>
          <span className={styles.title}>{result.title}</span>
          {result.isDemo && <span className={styles.demoBadge}>Demo material</span>}
        </div>
      </div>
      <div className={styles.buttonRow}>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.button} ${styles.primaryButton}`}
        >
          Open
        </a>
        <a href={result.url} download className={styles.button}>
          Download
        </a>
      </div>
    </div>
  );
}

