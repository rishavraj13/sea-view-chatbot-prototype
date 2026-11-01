import { KNOWLEDGE_COPY } from '@/content';
import { TraceSection } from './TraceSection';
import styles from './TraceResults.module.css';

export function TraceContext({ context }: { context: string }) {
  return (
    <TraceSection id="trace-context-heading" title={KNOWLEDGE_COPY.context}>
      <pre
        role="region"
        tabIndex={0}
        aria-label={KNOWLEDGE_COPY.contextText}
        className={styles.contextBlock}
      >
        {context}
      </pre>
      {!context && <p>{KNOWLEDGE_COPY.contextEmpty}</p>}
    </TraceSection>
  );
}
