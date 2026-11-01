'use client';

import { ComposerPrimitive, useAuiState } from '@assistant-ui/react';
import { CHAT_COPY, CHAT_UI } from '@/content';
import { CHAT_LIMITS } from './limits';
import styles from './ChatComposer.module.css';

export function ChatComposer() {
  const text = useAuiState((state) => state.composer.text);
  const running = useAuiState((state) => state.thread.isRunning);
  const full = useAuiState(
    (state) => state.thread.messages.length >= CHAT_LIMITS.messages,
  );
  return (
    <div className={styles.container}>
      {full && <p role="status">{CHAT_COPY.limit}</p>}
      <ComposerPrimitive.Root className={styles.form}>
        <label htmlFor="chat-composer" className="sr-only">
          {CHAT_COPY.question}
        </label>
        <ComposerPrimitive.Input
          id="chat-composer"
          className={styles.textarea}
          placeholder={CHAT_COPY.placeholder}
          maxLength={CHAT_LIMITS.text}
          rows={1}
          maxRows={5}
          disabled={running || full}
          autoFocus={false}
          cancelOnEscape={false}
          addAttachmentOnPaste={false}
          submitMode="enter"
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              (!text.trim() || full || running)
            )
              event.preventDefault();
          }}
        />
        <ComposerPrimitive.Send
          className={styles.sendButton}
          disabled={running || full || !text.trim()}
        >
          {CHAT_UI.sendButton}
        </ComposerPrimitive.Send>
      </ComposerPrimitive.Root>
    </div>
  );
}
