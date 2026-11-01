'use client';

import { retryLabel } from '@/content';
import { errorCopy, type ProductError } from './api-error';
import { useCountdown } from './useCountdown';
import styles from './ChatPanel.module.css';

/** Shared safe error rendering; mount a fresh instance for each failed attempt. */
export function RequestError({
  error,
  onRetry,
}: {
  error: ProductError;
  onRetry: () => void;
}) {
  const seconds = useCountdown(error.retryAfterSeconds);
  return (
    <div className={styles.errorBanner} role="alert">
      <p className={styles.errorMessage}>{errorCopy(error)}</p>
      <button
        type="button"
        className={styles.retryButton}
        disabled={seconds > 0}
        onClick={onRetry}
      >
        {retryLabel(seconds)}
      </button>
    </div>
  );
}
