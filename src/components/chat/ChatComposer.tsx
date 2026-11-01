'use client';

import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useRef,
  useEffect,
} from 'react';
import styles from './ChatComposer.module.css';

interface ChatComposerProps {
  readonly text: string;
  readonly onChange: (text: string) => void;
  readonly onSubmit: () => void;
  readonly isLoading: boolean;
}

export function ChatComposer({
  text,
  onChange,
  onSubmit,
  isLoading,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height to fit content up to 140px
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && text.trim().length > 0) {
        onSubmit();
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isLoading && text.trim().length > 0) {
      onSubmit();
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="chat-composer" className="sr-only">
          Ask a question
        </label>
        <textarea
          ref={textareaRef}
          id="chat-composer"
          className={styles.textarea}
          value={text}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question…"
          maxLength={4000}
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={isLoading || text.trim().length === 0}
          aria-label="Send question"
        >
          Send
        </button>
      </form>
    </div>
  );
}

