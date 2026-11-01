'use client';

import { CHAT_UI } from '@/content';
import { useChatDialog } from '../ChatContext';
import styles from './ChatLauncher.module.css';

export function ChatLauncher() {
  const { openChat } = useChatDialog();

  return (
    <button
      type="button"
      className={styles.launcher}
      onClick={() => openChat()}
    >
      {CHAT_UI.launcher}
    </button>
  );
}
