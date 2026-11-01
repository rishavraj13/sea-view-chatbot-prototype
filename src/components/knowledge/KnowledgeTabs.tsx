'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { KNOWLEDGE_COPY, KNOWLEDGE_UI } from '@/content';
import { SourcesTab } from './SourcesTab';
import { MediaTab } from './MediaTab';
import { TraceTab } from './TraceTab';
import { knowledgeSourcesSchema } from './schemas';
import { useKnowledgeRequest } from './useKnowledgeRequest';
import { RequestError } from '../chat/RequestError';
import styles from './KnowledgeTabs.module.css';

const tabs = [
  { id: 'sources', label: KNOWLEDGE_UI.tabSources },
  { id: 'media', label: KNOWLEDGE_UI.tabMedia },
  { id: 'trace', label: KNOWLEDGE_UI.tabTrace },
] as const;
export function KnowledgeTabs() {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const { data, error, pending, attempt, run, retry } = useKnowledgeRequest(
    '/api/knowledge/sources',
    knowledgeSourcesSchema,
  );
  useEffect(() => {
    void run();
  }, [run]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        next = (index + tabs.length - 1) % tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setSelected(next);
    buttons.current[next]?.focus();
  }
  return (
    <div className={styles.container}>
      <div
        className={styles.tabList}
        role="tablist"
        aria-label={KNOWLEDGE_COPY.tabs}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected === index}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected === index ? 0 : -1}
            onKeyDown={(event) => navigate(event, index)}
            onClick={() => setSelected(index)}
            className={`${styles.tab} ${selected === index ? styles.tabActive : ''}`}
          >
            {tab.label}
            {data && tab.id !== 'trace' && (
              <span aria-hidden="true"> ({data[tab.id].length})</span>
            )}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          tabIndex={0}
          hidden={selected !== index}
          className={styles.tabPanel}
        >
          <h2 className="sr-only">{tab.label}</h2>
          {tab.id === 'trace' ? (
            <TraceTab />
          ) : pending ? (
            <p role="status">{KNOWLEDGE_COPY.loading}</p>
          ) : error ? (
            <RequestError key={attempt} error={error} onRetry={retry} />
          ) : tab.id === 'sources' ? (
            <SourcesTab sources={data?.sources ?? []} />
          ) : (
            <MediaTab media={data?.media ?? []} />
          )}
        </div>
      ))}
    </div>
  );
}
