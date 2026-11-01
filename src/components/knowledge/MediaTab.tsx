import { CHAT_COPY, KNOWLEDGE_COPY } from '@/content';
import type { KnowledgeMediaItem } from './schemas';
import styles from './MediaTab.module.css';

export function MediaTab({ media }: { media: readonly KnowledgeMediaItem[] }) {
  if (!media.length) return <p role="status">{KNOWLEDGE_COPY.mediaEmpty}</p>;
  return (
    <div className={styles.grid}>
      {media.map((item) => (
        <article key={item.id} className={styles.card}>
          <div className={styles.topRow}>
            <span className={styles.typeBadge}>{item.type}</span>
            <div className={styles.statusRow}>
              {item.isDemo && (
                <span className={styles.demoBadge}>{CHAT_COPY.demo}</span>
              )}
              <span
                className={
                  item.available ? styles.availBadge : styles.unavailBadge
                }
              >
                {item.available
                  ? KNOWLEDGE_COPY.available
                  : KNOWLEDGE_COPY.unavailable}
              </span>
            </div>
          </div>
          <h3 className={styles.title}>{item.title}</h3>
          <div className={styles.urlRow}>
            {item.available && item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {item.url} ↗
              </a>
            ) : (
              <span>{KNOWLEDGE_COPY.noAsset}</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
