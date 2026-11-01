import { CHAT_COPY, KNOWLEDGE_COPY, TRACE_UI } from '@/content';
import type { TraceResponse } from './schemas';
import type { TraceFormValues } from './trace-input';
import { TraceQuestion } from './TraceQuestion';
import { TraceContext } from './TraceContext';
import { TraceChunks } from './TraceChunks';
import { TraceTools } from './TraceTools';
import { TraceMedia } from './TraceMedia';
import { TraceAnswer } from './TraceAnswer';
import styles from './TraceResults.module.css';

export function TraceResults({
  trace,
  submitted,
}: {
  trace: TraceResponse;
  submitted: TraceFormValues;
}) {
  return (
    <section
      className={styles.resultSection}
      aria-label={KNOWLEDGE_COPY.resultRegion}
    >
      <TraceQuestion submitted={submitted} />
      <TraceContext context={trace.context} />
      <TraceChunks chunks={trace.chunks} />
      <TraceTools calls={trace.toolCalls} />
      <TraceMedia media={trace.media} />
      <TraceAnswer text={trace.text} citations={trace.citations} />
      <div className={styles.chipsRow}>
        <span className={styles.chip}>
          {TRACE_UI.mode}: {trace.mode}
        </span>
        <span className={styles.chip}>
          {TRACE_UI.provider}: {trace.provider}
        </span>
        <span className={styles.chip}>
          {TRACE_UI.model}: {trace.modelId}
        </span>
        {trace.isDemo && <span className={styles.chip}>{CHAT_COPY.demo}</span>}
      </div>
      <p className={styles.pipelineBanner}>{TRACE_UI.output}</p>
    </section>
  );
}
