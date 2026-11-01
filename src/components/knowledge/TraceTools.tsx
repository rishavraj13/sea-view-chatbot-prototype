import { KNOWLEDGE_COPY } from '@/content';
import type { TraceResponse } from './schemas';
import { TraceSection } from './TraceSection';
import { MediaReceipt } from './TraceMedia';
import styles from './TraceResults.module.css';

export function TraceTools({ calls }: { calls: TraceResponse['toolCalls'] }) {
  return (
    <TraceSection id="trace-tools" title={KNOWLEDGE_COPY.tools}>
      {calls.length ? (
        calls.map((call, index) => (
          <div key={`${call.name}-${index}`} className={styles.chunkItem}>
            <h4>{call.name}</h4>
            <p>{KNOWLEDGE_COPY.input}</p>
            <dl>
              <dt>{KNOWLEDGE_COPY.assetId}</dt>
              <dd>{call.input.id}</dd>
            </dl>
            <p>{KNOWLEDGE_COPY.result}</p>
            <MediaReceipt media={call.result} />
          </div>
        ))
      ) : (
        <p>{KNOWLEDGE_COPY.noTools}</p>
      )}
    </TraceSection>
  );
}
