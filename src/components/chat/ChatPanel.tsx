'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { DefaultChatTransport, readUIMessageStream, type UIMessage } from 'ai';
import { useChatDialog } from '../ChatContext';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatMessage } from './ChatMessage';
import { ChatComposer } from './ChatComposer';
import { getErrorMessage, parseErrorResponse } from './error-mapping';
import type { ChatErrorData } from './types';
import styles from './ChatPanel.module.css';

export function ChatPanel() {
  const { isOpen, closeChat, prefilledPrompt, clearPrefill } = useChatDialog();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [errorData, setErrorData] = useState<ChatErrorData | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [announcement, setAnnouncement] = useState('');

  // Handle native <dialog> open/close and focus
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      const composer = document.getElementById('chat-composer');
      if (composer) {
        composer.focus();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Handle prefill from external buttons (e.g. package ask button)
  useEffect(() => {
    if (!isOpen || !prefilledPrompt) return;
    const task = setTimeout(() => {
      setInputText(prefilledPrompt);
      clearPrefill();
    }, 0);
    return () => clearTimeout(task);
  }, [isOpen, prefilledPrompt, clearPrefill]);

  // Loading timer (8s transition to "Taking longer than usual")
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => {
      setIsSlowLoading(true);
    }, 8000);
    return () => {
      clearTimeout(timer);
      setIsSlowLoading(false);
    };
  }, [isLoading]);

  // Rate-limit countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, errorData]);

  // Handle ESC or native close
  const handleDialogClose = () => {
    closeChat();
  };

  const handleNewConversation = () => {
    setMessages([]);
    setInputText('');
    setErrorData(null);
    setCountdown(0);
    setAnnouncement('Started a new conversation.');
  };

  const executeSend = useCallback(
    async (textToSend: string) => {
      const trimmed = textToSend.trim();
      if (!trimmed || isLoading) return;

      setErrorData(null);
      setCountdown(0);
      setIsLoading(true);
      setInputText('');

      const userMessage: UIMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        parts: [{ type: 'text', text: trimmed }],
      };

      const outgoing = [...messages, userMessage];
      setMessages(outgoing);

      try {
        const transport = new DefaultChatTransport({
          api: '/api/chat',
        });

        const stream = await transport.sendMessages({
          trigger: 'submit-message',
          chatId: 'active-chat',
          messageId: undefined,
          abortSignal: undefined,
          messages: outgoing,
        });

        let latestAssistant: UIMessage | undefined;
        for await (const part of readUIMessageStream({ stream })) {
          latestAssistant = part;
          if (part.metadata && typeof part.metadata === 'object' && 'mode' in part.metadata) {
            if ((part.metadata as { mode?: string }).mode === 'mock') {
              setIsMockMode(true);
            }
          }
          setMessages([...outgoing, part]);
        }

        if (latestAssistant) {
          const assistantText = latestAssistant.parts
            .filter((p) => p.type === 'text')
            .map((p) => ('text' in p ? p.text : ''))
            .join(' ');
          setAnnouncement(assistantText || 'New answer received.');
        }
      } catch (err: unknown) {
        let parsed: ChatErrorData = {
          code: 'MODEL_FAILURE',
          message: 'The model is temporarily unavailable.',
        };

        if (typeof err === 'object' && err !== null && 'response' in err) {
          try {
            const resp = (err as { response?: { json?: () => Promise<unknown> } }).response;
            if (resp && typeof resp.json === 'function') {
              const body = await resp.json();
              parsed = parseErrorResponse(body);
            }
          } catch {
            // Keep default parsed
          }
        } else if (err instanceof Error) {
          if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            parsed = {
              code: 'TIMEOUT',
              message: 'The model timed out. Please retry.',
            };
          }
        }

        setErrorData(parsed);
        if (parsed.retryAfterSeconds && parsed.retryAfterSeconds > 0) {
          setCountdown(parsed.retryAfterSeconds);
        }
        setAnnouncement(`Error: ${getErrorMessage(parsed)}`);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading],
  );

  const handleRetry = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) return;
    const text = lastUserMessage.parts
      .filter((p) => p.type === 'text')
      .map((p) => ('text' in p ? p.text : ''))
      .join('\n');
    if (text) {
      executeSend(text);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={handleDialogClose}
      aria-labelledby="chat-panel-title"
    >
      <div className={styles.sheet}>
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 id="chat-panel-title" className={styles.title}>
              Ask about your jump
            </h2>
            <span className={styles.subtitle}>Answers come from greedyadventures.com</span>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={handleNewConversation}
              aria-label="New conversation"
            >
              New conversation
            </button>
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeChat}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
        </header>

        {isMockMode && (
          <div className={styles.mockStrip} role="status">
            Mock mode: scripted answers, not a live model
          </div>
        )}

        <div className={styles.messageArea}>
          {messages.length === 0 ? (
            <ChatEmptyState onSelectPrompt={executeSend} />
          ) : (
            messages.map((m) => <ChatMessage key={m.id} message={m} />)
          )}

          {isLoading && (
            <div className={styles.loadingSkeleton} role="status" aria-label="Loading response">
              <span className={styles.loadingText}>Looking through the website…</span>
              {isSlowLoading && (
                <span className={styles.loadingSubtext}>Taking longer than usual</span>
              )}
              <div className={styles.skeletonBar} />
              <div className={`${styles.skeletonBar} ${styles.skeletonBarShort}`} />
            </div>
          )}

          {errorData && (
            <div className={styles.errorBanner} role="alert">
              <p className={styles.errorMessage}>{getErrorMessage(errorData)}</p>
              <button
                type="button"
                className={styles.retryButton}
                onClick={handleRetry}
                disabled={countdown > 0}
                aria-label={countdown > 0 ? `Retry disabled for ${countdown} seconds` : 'Retry'}
              >
                {countdown > 0 ? `Retry in ${countdown}s` : 'Retry'}
              </button>
            </div>
          )}

          <div ref={messageEndRef} />
        </div>

        <ChatComposer
          text={inputText}
          onChange={setInputText}
          onSubmit={() => executeSend(inputText)}
          isLoading={isLoading}
        />

        {/* Accessible live region */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>
      </div>
    </dialog>
  );
}
