'use client';

import { useState, type FormEvent } from 'react';
import {
  KNOWLEDGE_COPY,
  KNOWLEDGE_UI,
  STARTER_PROMPTS,
  TRACE_UI,
} from '@/content';
import { CHAT_LIMITS } from '../chat/limits';
import { traceFormSchema, type TraceFormValues } from './trace-input';
import styles from './TraceForm.module.css';

export function TraceForm({
  pending,
  onRun,
}: {
  pending: boolean;
  onRun: (values: TraceFormValues) => void;
}) {
  const [values, setValues] = useState({
    question: '',
    earlierUser: '',
    earlierAssistant: '',
  });
  const [validation, setValidation] = useState('');
  const setField = (key: keyof TraceFormValues, value: string) => {
    setValues((prior) => ({ ...prior, [key]: value }));
    setValidation('');
  };
  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = traceFormSchema.safeParse(values);
    if (!parsed.success) {
      setValidation(
        parsed.error.issues.some((issue) => issue.path[0] === 'earlierUser')
          ? KNOWLEDGE_COPY.historyValidation
          : KNOWLEDGE_COPY.questionValidation,
      );
      return;
    }
    setValidation('');
    onRun(parsed.data);
  }
  return (
    <form onSubmit={submit} className={styles.formCard}>
      <div className={styles.presetsRow}>
        <span className={styles.presetLabel}>{KNOWLEDGE_COPY.presets}:</span>
        {STARTER_PROMPTS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={styles.presetButton}
            onClick={() => setField('question', preset)}
            disabled={pending}
          >
            {preset}
          </button>
        ))}
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="trace-question" className={styles.fieldLabel}>
          {TRACE_UI.question}
        </label>
        <textarea
          id="trace-question"
          className={styles.textarea}
          value={values.question}
          onChange={(event) => setField('question', event.target.value)}
          maxLength={CHAT_LIMITS.text}
          placeholder={KNOWLEDGE_COPY.placeholder}
          disabled={pending}
          required
        />
      </div>
      <details className={styles.earlierDetails}>
        <summary className={styles.earlierSummary}>
          {TRACE_UI.earlierTurns}
        </summary>
        <div className={styles.earlierInputs}>
          <div className={styles.fieldGroup}>
            <label htmlFor="earlier-user" className={styles.fieldLabel}>
              {KNOWLEDGE_COPY.user}
            </label>
            <textarea
              id="earlier-user"
              className={styles.textarea}
              value={values.earlierUser}
              onChange={(event) => setField('earlierUser', event.target.value)}
              maxLength={CHAT_LIMITS.text}
              disabled={pending}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="earlier-assistant" className={styles.fieldLabel}>
              {KNOWLEDGE_COPY.assistant}
            </label>
            <textarea
              id="earlier-assistant"
              className={styles.textarea}
              value={values.earlierAssistant}
              onChange={(event) =>
                setField('earlierAssistant', event.target.value)
              }
              maxLength={CHAT_LIMITS.text}
              disabled={pending}
            />
          </div>
        </div>
      </details>
      {validation && <p role="alert">{validation}</p>}
      <button type="submit" className={styles.submitButton} disabled={pending}>
        {pending
          ? KNOWLEDGE_UI.runningTraceButton
          : KNOWLEDGE_UI.runTraceButton}
      </button>
      <p className={styles.note}>{KNOWLEDGE_COPY.runNote}</p>
    </form>
  );
}
