import { CHAT_COPY, KNOWLEDGE_COPY } from '@/content';
import type { MediaResult } from '../chat/types';
import { TraceSection } from './TraceSection';
import styles from './TraceResults.module.css';

export function MediaReceipt({ media }: { media: MediaResult }) {
  return (
    <div className={styles.stepContent}>
      <p>{media.title}</p>
      <dl>
        <dt>{KNOWLEDGE_COPY.assetId}</dt>
        <dd>{media.id}</dd>
        <dt>{KNOWLEDGE_COPY.kind}</dt>
        <dd>{media.kind}</dd>
        {media.kind === 'unavailable' ? (
          <>
            <dt>{KNOWLEDGE_COPY.status}</dt>
            <dd>{CHAT_COPY.unavailable}</dd>
            <dt>{KNOWLEDGE_COPY.reason}</dt>
            <dd>{media.reason}</dd>
          </>
        ) : (
          <>
            <dt>{KNOWLEDGE_COPY.type}</dt>
            <dd>{media.type}</dd>
            <dt>{KNOWLEDGE_COPY.url}</dt>
            <dd>
              <a
                href={media.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.chunkLink}
              >
                {media.url} ↗
              </a>
            </dd>
          </>
        )}
      </dl>
      {media.isDemo && <span className={styles.chip}>{CHAT_COPY.demo}</span>}
    </div>
  );
}
export function TraceMedia({ media }: { media: readonly MediaResult[] }) {
  return (
    <TraceSection id="trace-media" title={KNOWLEDGE_COPY.media}>
      {media.length ? (
        media.map((item) => <MediaReceipt key={item.id} media={item} />)
      ) : (
        <p>{KNOWLEDGE_COPY.noMedia}</p>
      )}
    </TraceSection>
  );
}
