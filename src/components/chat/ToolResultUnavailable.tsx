import styles from './ToolResultUnavailable.module.css';
import { CHAT_COPY } from '@/content';

export function ToolResultUnavailable() {
  return (
    <p className={styles.note} role="note">
      {CHAT_COPY.unavailable}
    </p>
  );
}
