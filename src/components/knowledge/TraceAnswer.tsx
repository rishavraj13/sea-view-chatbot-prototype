import { KNOWLEDGE_COPY } from '@/content';
import type { TraceResponse } from './schemas';
import { deduplicateSourcesByPage } from '../chat/source-utils';
import { TraceSection } from './TraceSection';
import styles from './TraceResults.module.css';

export function TraceAnswer({
  text,
  citations,
}: {
  text: string;
  citations: TraceResponse['citations'];
}) {
  const chips = deduplicateSourcesByPage(citations);
  return (
    <TraceSection id="trace-answer" title={KNOWLEDGE_COPY.answer}>
      <p className={styles.stepContent}>{text}</p>
      <div
        role="region"
        aria-label={KNOWLEDGE_COPY.citations}
        className={styles.chipsRow}
      >
        {chips.length ? (
          chips.map((chip) => (
            <a
              key={chip.pageKey}
              href={chip.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.chip}
            >
              {chip.label} ↗
            </a>
          ))
        ) : (
          <p>{KNOWLEDGE_COPY.noCitations}</p>
        )}
      </div>
    </TraceSection>
  );
}
