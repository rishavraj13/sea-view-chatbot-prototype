'use client';

import { useId, useState, type ReactNode } from 'react';
import { CHAT_COPY } from '@/content';
import styles from './AssistantAnswer.module.css';

export function AssistantAnswer({
  text,
  children,
}: {
  readonly text: string;
  readonly children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const long = text.length > 600;
  return (
    <>
      <div
        id={id}
        data-answer-text
        className={long && !expanded ? styles.clamped : undefined}
      >
        {children}
      </div>
      {long && (
        <button
          type="button"
          className={styles.toggle}
          aria-controls={id}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? CHAT_COPY.showLess : CHAT_COPY.showFull}
        </button>
      )}
    </>
  );
}
