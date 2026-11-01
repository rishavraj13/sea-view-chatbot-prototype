'use client';

import { useEffect, useState } from 'react';
import { useAui } from '@assistant-ui/react';
import { CHAT_COPY, retryLabel } from '@/content';
import { errorCopy, type ProductError } from './api-error';
import styles from './ChatPanel.module.css';

export function ChatError({ error }: { error: ProductError }) {
  const runtime = useAui();
  const [seconds, setSeconds] = useState(error.retryAfterSeconds ?? 0);
  const [deadline] = useState(
    () => Date.now() + (error.retryAfterSeconds ?? 0) * 1000,
  );
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(
      () => setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))),
      1000,
    );
    return () => clearInterval(timer);
  }, [seconds, deadline]);
  return (
    <div className={styles.errorBanner} role="alert">
      <p className={styles.errorMessage}>{errorCopy(error)}</p>
      <button
        type="button"
        className={styles.retryButton}
        disabled={seconds > 0}
        onClick={() => {
          const user = runtime.thread
            .getState()
            .messages.findLast((message) => message.role === 'user');
          if (user) runtime.thread.startRun({ parentId: user.id });
        }}
      >
        {retryLabel(seconds)}
      </button>
    </div>
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
