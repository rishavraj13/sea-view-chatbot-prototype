import { KNOWLEDGE_COPY } from '@/content';
import type { TraceFormValues } from './trace-input';
import { TraceSection } from './TraceSection';
import styles from './TraceResults.module.css';

export function TraceQuestion({ submitted }: { submitted: TraceFormValues }) {
  return (
    <TraceSection id="trace-result-question" title={KNOWLEDGE_COPY.question}>
      <p className={styles.stepContent}>{submitted.question}</p>
      {submitted.earlierUser && (
        <div>
          <h4>{KNOWLEDGE_COPY.earlier}</h4>
          <p>{KNOWLEDGE_COPY.user}</p>
          <p className={styles.stepContent}>{submitted.earlierUser}</p>
          <p>{KNOWLEDGE_COPY.assistant}</p>
          <p className={styles.stepContent}>{submitted.earlierAssistant}</p>
        </div>
      )}
    </TraceSection>
  );
}
