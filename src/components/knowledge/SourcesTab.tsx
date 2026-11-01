import { CHAT_COPY, KNOWLEDGE_COPY } from '@/content';
import type { KnowledgeSource } from './schemas';
import styles from './SourcesTab.module.css';

export function SourcesTab({
  sources,
}: {
  sources: readonly KnowledgeSource[];
}) {
  if (!sources.length)
    return <p role="status">{KNOWLEDGE_COPY.sourcesEmpty}</p>;
  return (
    <div className={styles.list}>
      {sources.map((source) => (
        <article key={`${source.title}-${source.url}`} className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.title}>{source.title}</h3>
            {source.isDemo && (
              <span className={styles.demoBadge}>{CHAT_COPY.demo}</span>
            )}
          </div>
          <div className={styles.metaRow}>
            <span>
              {KNOWLEDGE_COPY.url}:{' '}
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                {source.url} ↗
              </a>
            </span>
            <span>
              {KNOWLEDGE_COPY.captured}:{' '}
              <time dateTime={source.capturedAt}>{source.capturedAt}</time>
            </span>
          </div>
          <details className={styles.details}>
            <summary className={styles.summary}>
              {KNOWLEDGE_COPY.fullSource}
            </summary>
            <pre className={styles.textBlock}>{source.text}</pre>
          </details>
        </article>
      ))}
    </div>
  );
}
