'use client';

import { useEffect, useMemo, useRef } from 'react';
import { ThreadPrimitive, useAui, useAuiState } from '@assistant-ui/react';
import { useAISDKChat, useAISDKError } from '@assistant-ui/react-ai-sdk';
import { CHAT_COPY, CHAT_UI } from '@/content';
import { useChatDialog } from '../ChatContext';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatMessage } from './ChatMessage';
import { ChatComposer } from './ChatComposer';
import { ChatError, ChatLoading } from './ChatFeedback';
import { parseChatError, errorCopy } from './api-error';
import { responseMode } from './mode';
import styles from './ChatPanel.module.css';

export function ChatPanel() {
  const { isOpen, closeChat, newConversation } = useChatDialog();
  const runtime = useAui();
  const empty = useAuiState((state) => state.thread.isEmpty);
  const running = useAuiState((state) => state.thread.isRunning);
  const chat = useAISDKChat();
  const rawError = useAISDKError();
  const error = useMemo(
    () => (rawError ? parseChatError(rawError) : undefined),
    [rawError],
  );
  const mode = responseMode(chat?.messages ?? [], error);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (isOpen) {
      if (!dialog.current?.open) dialog.current?.showModal();
      dialog.current?.querySelector('textarea')?.focus();
    } else if (dialog.current?.open) dialog.current.close();
  }, [isOpen]);
  const answer =
    chat?.messages
      .findLast((message) => message.role === 'assistant')
      ?.parts.filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join(' ') ?? '';
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      onClose={closeChat}
      aria-labelledby="chat-panel-title"
    >
      <ThreadPrimitive.Root className={styles.sheet}>
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 id="chat-panel-title" className={styles.title}>
              {CHAT_COPY.title}
            </h2>
            <span className={styles.subtitle}>{CHAT_COPY.subtitle}</span>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => void newConversation()}
            >
              {CHAT_UI.newConversation}
            </button>
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeChat}
              aria-label={CHAT_UI.closeButton}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </header>
        {mode === 'mock' && (
          <div className={styles.mockStrip} role="status">
            {CHAT_COPY.mock}
          </div>
        )}
        <ThreadPrimitive.Viewport className={styles.messageArea}>
          {empty && (
            <ChatEmptyState
              onSelectPrompt={(prompt) => runtime.thread.append(prompt)}
            />
          )}
          <ThreadPrimitive.Messages>
            {() => <ChatMessage />}
          </ThreadPrimitive.Messages>
          {running && <ChatLoading />}
          {error && <ChatError error={error} />}
        </ThreadPrimitive.Viewport>
        <ChatComposer />
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {error ? errorCopy(error) : answer || CHAT_COPY.reset}
        </div>
      </ThreadPrimitive.Root>
    </dialog>
  );
}
