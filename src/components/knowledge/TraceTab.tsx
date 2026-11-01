'use client';

import { useState, type FormEvent } from 'react';
import { KNOWLEDGE_UI, STARTER_PROMPTS } from '@/content';
import { getErrorMessage, parseErrorResponse } from '../chat/error-mapping';
import type { ChatErrorData } from '../chat/types';
import type { TraceResponse } from './types';
import styles from './TraceTab.module.css';

export function TraceTab() {
  const [question, setQuestion] = useState('');
  const [earlierUser, setEarlierUser] = useState('');
  const [earlierAssistant, setEarlierAssistant] = useState('');
  const [hasEarlierTurns, setHasEarlierTurns] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [traceResult, setTraceResult] = useState<TraceResponse | null>(null);
  const [lastSubmittedQuestion, setLastSubmittedQuestion] = useState('');
  const [errorData, setErrorData] = useState<ChatErrorData | null>(null);

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmedQ = question.trim();
    if (!trimmedQ || isLoading) return;

    setIsLoading(true);
    setErrorData(null);
    setLastSubmittedQuestion(trimmedQ);

    const body: {
      question: string;
      messages?: Array<{
        id: string;
        role: 'user' | 'assistant';
        parts: Array<{ type: 'text'; text: string }>;
      }>;
    } = { question: trimmedQ };

    if (hasEarlierTurns && earlierUser.trim() && earlierAssistant.trim()) {
      body.messages = [
        {
          id: 'turn-0',
          role: 'user',
          parts: [{ type: 'text', text: earlierUser.trim() }],
        },
        {
          id: 'turn-1',
          role: 'assistant',
          parts: [{ type: 'text', text: earlierAssistant.trim() }],
        },
        {
          id: 'turn-2',
          role: 'user',
          parts: [{ type: 'text', text: trimmedQ }],
        },
      ];
    }

    try {
      const resp = await fetch('/api/knowledge/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const errorJson = await resp.json().catch(() => ({}));
        setErrorData(parseErrorResponse(errorJson));
        setTraceResult(null);
      } else {
        const data = await resp.json();
        setTraceResult(data);
      }
    } catch {
      setErrorData({
        code: 'MODEL_FAILURE',
        message: 'The model is temporarily unavailable.',
      });
      setTraceResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.presetsRow}>
          <span className={styles.presetLabel}>Starter presets:</span>
          {STARTER_PROMPTS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={styles.presetButton}
              onClick={() => setQuestion(preset)}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="trace-question" className={styles.fieldLabel}>
            Question to test
          </label>
          <textarea
            id="trace-question"
            className={styles.textarea}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter question to run through retrieval and pipeline…"
            maxLength={4000}
            required
            disabled={isLoading}
          />
        </div>

        <details
          className={styles.earlierDetails}
          open={hasEarlierTurns}
          onToggle={(e) => setHasEarlierTurns((e.target as HTMLDetailsElement).open)}
        >
          <summary className={styles.earlierSummary}>
            Optional earlier turns (conversation history)
          </summary>
          <div className={styles.earlierInputs}>
            <div className={styles.fieldGroup}>
              <label htmlFor="earlier-user" className={styles.fieldLabel}>
                Prior user turn text
              </label>
              <textarea
                id="earlier-user"
                className={styles.textarea}
                value={earlierUser}
                onChange={(e) => setEarlierUser(e.target.value)}
                placeholder="User's previous message…"
                disabled={isLoading}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="earlier-assistant" className={styles.fieldLabel}>
                Prior assistant turn text
              </label>
              <textarea
                id="earlier-assistant"
                className={styles.textarea}
                value={earlierAssistant}
                onChange={(e) => setEarlierAssistant(e.target.value)}
                placeholder="Assistant's previous answer…"
                disabled={isLoading}
              />
            </div>
          </div>
        </details>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading || !question.trim()}
        >
          {isLoading ? KNOWLEDGE_UI.runningTraceButton : KNOWLEDGE_UI.runTraceButton}
        </button>
      </form>

      {errorData && (
        <div className={styles.errorBox} role="alert">
          <p className={styles.errorMessage}>{getErrorMessage(errorData)}</p>
          <button
            type="button"
            className={styles.presetButton}
            onClick={() => handleSubmit()}
          >
            Retry test
          </button>
        </div>
      )}

      {traceResult ? (
        <section className={styles.resultSection} aria-label="Pipeline trace output">
          <p className={styles.pipelineBanner}>Output from the real pipeline</p>

          <div className={styles.chipsRow}>
            <span className={styles.chip}>Mode: {traceResult.mode}</span>
            <span className={styles.chip}>Provider: {traceResult.provider}</span>
            <span className={styles.chip}>Model: {traceResult.modelId}</span>
            {traceResult.isDemo && <span className={styles.chip}>Demo material</span>}
          </div>

          {/* 1. Question */}
          <div className={styles.stepBlock}>
            <h3 className={styles.stepHeader}>1. Question</h3>
            <p className={styles.stepContent}>{lastSubmittedQuestion}</p>
          </div>

          {/* 2. Retrieval query */}
          <div className={styles.stepBlock}>
            <h3 className={styles.stepHeader}>2. Retrieval query</h3>
            <p className={styles.stepContent}>{lastSubmittedQuestion}</p>
          </div>

          {/* 3. Chunks passed to the model */}
          <div className={styles.stepBlock}>
            <h3 className={styles.stepHeader}>
              3. Chunks passed to the model ({traceResult.chunks.length})
            </h3>
            <div>
              {traceResult.chunks.map((chunk) => (
                <div key={chunk.id} className={styles.chunkItem}>
                  <div className={styles.chunkTop}>
                    <span className={styles.chunkScore}>Score: {chunk.score.toFixed(2)}</span>
                    <a
                      href={chunk.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.chunkLink}
                    >
                      {chunk.source.title} ({chunk.source.url}) ↗
                    </a>
                  </div>
                  <details>
                    <summary className={styles.summary}>View full chunk text</summary>
                    <pre className={styles.stepContent}>{chunk.text}</pre>
                  </details>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Tools selected */}
          <div className={styles.stepBlock}>
            <h3 className={styles.stepHeader}>4. Tools selected</h3>
            <p className={styles.stepContent}>
              {traceResult.toolCalls.length > 0
                ? traceResult.toolCalls.join(', ')
                : 'None'}
            </p>
          </div>

          {/* 5. Media resolved */}
          <div className={styles.stepBlock}>
            <h3 className={styles.stepHeader}>5. Media resolved</h3>
            <div className={styles.stepContent}>
              {traceResult.media.length > 0 ? (
                traceResult.media.map((m) => (
                  <div key={m.id}>
                    • {m.title} ({m.kind}, available: {m.kind !== 'unavailable' ? 'true' : 'false'})
                  </div>
                ))
              ) : (
                'None'
              )}
            </div>
          </div>

          {/* 6. Answer text and citations */}
          <div className={styles.stepBlock}>
            <h3 className={styles.stepHeader}>6. Answer text and citations</h3>
            <div className={styles.stepContent}>
              <p>{traceResult.text}</p>
              {traceResult.citations && traceResult.citations.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {traceResult.citations.map((c) => (
                    <a
                      key={c.sourceId}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.chip}
                    >
                      {c.title || c.url} ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        !isLoading &&
        !errorData && (
          <div className={styles.emptyState}>
            Select a question preset above or enter a question to inspect the retrieval, chunks, tools, and model output.
          </div>
        )
      )}
    </div>
  );
}

