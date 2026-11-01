'use client';

import { useChatDialog } from '../ChatContext';
import styles from './ChatLauncher.module.css';

export function ChatLauncher() {
  const { openChat } = useChatDialog();

  return (
    <button
      type="button"
      className={styles.launcher}
      onClick={() => openChat()}
      aria-label="Ask about your jump"
    >
      Ask about your jump
    </button>
  );
}
