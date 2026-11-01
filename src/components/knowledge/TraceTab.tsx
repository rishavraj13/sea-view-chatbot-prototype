'use client';

import { useState } from 'react';
import { KNOWLEDGE_COPY } from '@/content';
import { traceResponseSchema } from './schemas';
import { buildTraceRequest, type TraceFormValues } from './trace-input';
import { useKnowledgeRequest } from './useKnowledgeRequest';
import { TraceForm } from './TraceForm';
import { TraceResults } from './TraceResults';
import { RequestError } from '../chat/RequestError';
import styles from './TraceTab.module.css';

export function TraceTab() {
  const request = useKnowledgeRequest(
    '/api/knowledge/trace',
    traceResponseSchema,
  );
  const [submitted, setSubmitted] = useState<TraceFormValues | null>(null);
  return (
    <div className={styles.container}>
      <TraceForm
        pending={request.pending}
        onRun={(values) => {
          setSubmitted(values);
          void request.run(buildTraceRequest(values));
        }}
      />
      {request.error && (
        <RequestError
          key={request.attempt}
          error={request.error}
          onRetry={request.retry}
        />
      )}
      {request.data && submitted && (
        <TraceResults trace={request.data} submitted={submitted} />
      )}
      {!request.pending && !request.error && !request.data && (
        <p className={styles.emptyState}>{KNOWLEDGE_COPY.traceEmpty}</p>
      )}
    </div>
  );
}
