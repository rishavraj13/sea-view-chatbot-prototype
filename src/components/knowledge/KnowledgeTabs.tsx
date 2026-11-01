'use client';

import { useState, useEffect } from 'react';
import { KNOWLEDGE_UI } from '@/content';
import { SourcesTab } from './SourcesTab';
import { MediaTab } from './MediaTab';
import { TraceTab } from './TraceTab';
import type { KnowledgeSourcesResponse } from './types';
import styles from './KnowledgeTabs.module.css';

type TabKey = 'sources' | 'media' | 'trace';

export function KnowledgeTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>('sources');
  const [data, setData] = useState<KnowledgeSourcesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    async function loadSources() {
      try {
        const resp = await fetch('/api/knowledge/sources');
        if (!resp.ok) {
          throw new Error('Failed to load knowledge sources');
        }
        const json = await resp.json();
        setData(json);
      } catch {
        setError('Failed to load sources and media catalog.');
      } finally {
        setIsLoading(false);
      }
    }
    loadSources();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.tabList} role="tablist" aria-label="Knowledge explorer tabs">
        <button
          type="button"
          role="tab"
          id="tab-sources"
          aria-selected={activeTab === 'sources'}
          aria-controls="panel-sources"
          className={`${styles.tab} ${activeTab === 'sources' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('sources')}
        >
          <span>{KNOWLEDGE_UI.tabSources}</span>
          {data ? (
            <span aria-hidden="true" className={styles.tabBadge}>
              {' '}
              ({data.sources.length})
            </span>
          ) : null}
        </button>
        <button
          type="button"
          role="tab"
          id="tab-media"
          aria-selected={activeTab === 'media'}
          aria-controls="panel-media"
          className={`${styles.tab} ${activeTab === 'media' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('media')}
        >
          <span>{KNOWLEDGE_UI.tabMedia}</span>
          {data ? (
            <span aria-hidden="true" className={styles.tabBadge}>
              {' '}
              ({data.media.length})
            </span>
          ) : null}
        </button>
        <button
          type="button"
          role="tab"
          id="tab-trace"
          aria-selected={activeTab === 'trace'}
          aria-controls="panel-trace"
          className={`${styles.tab} ${activeTab === 'trace' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('trace')}
        >
          <span>{KNOWLEDGE_UI.tabTrace}</span>
        </button>
      </div>

      <div
        id="panel-sources"
        role="tabpanel"
        aria-labelledby="tab-sources"
        hidden={activeTab !== 'sources'}
        className={styles.tabPanel}
      >
        <SourcesTab
          sources={data?.sources ?? []}
          isLoading={isLoading}
          error={error}
        />
      </div>

      <div
        id="panel-media"
        role="tabpanel"
        aria-labelledby="tab-media"
        hidden={activeTab !== 'media'}
        className={styles.tabPanel}
      >
        <MediaTab
          media={data?.media ?? []}
          isLoading={isLoading}
          error={error}
        />
      </div>

      <div
        id="panel-trace"
        role="tabpanel"
        aria-labelledby="tab-trace"
        hidden={activeTab !== 'trace'}
        className={styles.tabPanel}
      >
        <TraceTab />
      </div>
    </div>
  );
}

