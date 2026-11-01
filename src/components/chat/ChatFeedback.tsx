'use client';

import { useEffect, useState } from 'react';
import { useAui } from '@assistant-ui/react';
import { CHAT_COPY } from '@/content';
import type { ProductError } from './api-error';
import { RequestError } from './RequestError';
import styles from './ChatPanel.module.css';

export function ChatError({ error }: { error: ProductError }) {
  const runtime = useAui();
  return (
    <RequestError
      error={error}
      onRetry={() => {
        const user = runtime.thread
          .getState()
          .messages.findLast((message) => message.role === 'user');
        if (user) runtime.thread.startRun({ parentId: user.id });
      }}
    />
  );
}
export function ChatLoading() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div
      className={styles.loadingSkeleton}
      role="status"
      aria-label={CHAT_COPY.loadingLabel}
    >
      <span className={styles.loadingText}>{CHAT_COPY.loading}</span>
      {slow && <span className={styles.loadingSubtext}>{CHAT_COPY.slow}</span>}
      <div className={styles.skeletonBar} />
      <div className={`${styles.skeletonBar} ${styles.skeletonBarShort}`} />
    </div>
  );
}
