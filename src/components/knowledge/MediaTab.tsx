import type { KnowledgeMediaItem } from './types';
import styles from './MediaTab.module.css';

interface MediaTabProps {
  readonly media: readonly KnowledgeMediaItem[];
  readonly isLoading: boolean;
  readonly error?: string;
}

export function MediaTab({ media, isLoading, error }: MediaTabProps) {
  if (isLoading) {
    return <p>Loading media catalog…</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <div className={styles.grid}>
      {media.map((item) => (
        <article key={item.id} className={styles.card}>
          <div className={styles.topRow}>
            <span className={styles.typeBadge}>{item.type}</span>
            <div className={styles.statusRow}>
              {item.isDemo && <span className={styles.demoBadge}>Demo material</span>}
              {item.available ? (
                <span className={styles.availBadge}>Available</span>
              ) : (
                <span className={styles.unavailBadge}>Unavailable</span>
              )}
            </div>
          </div>
          <h3 className={styles.title}>{item.title}</h3>
          <div className={styles.urlRow}>
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {item.url} ↗
              </a>
            ) : (
              <span>No asset URL (unavailable)</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

