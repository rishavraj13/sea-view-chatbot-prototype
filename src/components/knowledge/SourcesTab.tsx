import type { KnowledgeSource } from './types';
import styles from './SourcesTab.module.css';

interface SourcesTabProps {
  readonly sources: readonly KnowledgeSource[];
  readonly isLoading: boolean;
  readonly error?: string;
}

export function SourcesTab({ sources, isLoading, error }: SourcesTabProps) {
  if (isLoading) {
    return <p>Loading knowledge sources…</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <div className={styles.list}>
      {sources.map((source) => (
        <article key={`${source.title}-${source.url}`} className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.title}>{source.title}</h3>
            {source.isDemo && <span className={styles.demoBadge}>Demo material</span>}
          </div>
          <div className={styles.metaRow}>
            <span>
              URL:{' '}
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                {source.url} ↗
              </a>
            </span>
            <span>Captured: {source.capturedAt}</span>
          </div>
          <details className={styles.details}>
            <summary className={styles.summary}>View full captured text</summary>
            <pre className={styles.textBlock}>{source.text}</pre>
          </details>
        </article>
      ))}
    </div>
  );
}

