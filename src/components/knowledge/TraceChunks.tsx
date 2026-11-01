import { KNOWLEDGE_COPY, CHAT_COPY } from '@/content';
import type { TraceResponse } from './schemas';
import { TraceSection } from './TraceSection';
import styles from './TraceResults.module.css';

export function TraceChunks({ chunks }: { chunks: TraceResponse['chunks'] }) {
  return (
    <TraceSection id="trace-chunks" title={KNOWLEDGE_COPY.chunks}>
      {!chunks.length && <p>{KNOWLEDGE_COPY.noChunks}</p>}
      {chunks.map((chunk) => (
        <article key={chunk.id} className={styles.chunkItem}>
          <div className={styles.chunkTop}>
            <span>
              {KNOWLEDGE_COPY.score}: {chunk.score}
            </span>
            <a
              href={chunk.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.chunkLink}
            >
              {chunk.source.title} ({chunk.source.url}) ↗
            </a>
            {chunk.source.isDemo && (
              <span className={styles.chip}>{CHAT_COPY.demo}</span>
            )}
          </div>
          <details>
            <summary>{KNOWLEDGE_COPY.fullChunk}</summary>
            <pre className={styles.stepContent}>{chunk.text}</pre>
          </details>
        </article>
      ))}
    </TraceSection>
  );
}
