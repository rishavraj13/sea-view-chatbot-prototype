import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SourcesTab } from '@/components/knowledge/SourcesTab';
import { MediaTab } from '@/components/knowledge/MediaTab';
import type {
  KnowledgeSourcesResponse,
  TraceResponse,
} from '@/components/knowledge/types';

describe('Knowledge View components', () => {
  const sourcesFixtureFile = join(
    process.cwd(),
    'docs',
    'examples',
    'real-knowledge',
    'sources.json',
  );
  const sourcesData: KnowledgeSourcesResponse = JSON.parse(
    readFileSync(sourcesFixtureFile, 'utf8'),
  );

  const traceFixtureFile = join(
    process.cwd(),
    'docs',
    'examples',
    'real-knowledge',
    'trace-vip.json',
  );
  const traceData: { response: TraceResponse } = JSON.parse(
    readFileSync(traceFixtureFile, 'utf8'),
  );

  it('renders SourcesTab with titles, external URLs, captured dates and details', () => {
    const html = renderToStaticMarkup(
      <SourcesTab
        sources={sourcesData.sources}
        isLoading={false}
      />,
    );

    for (const source of sourcesData.sources.slice(0, 3)) {
      expect(html).toContain(source.title);
      expect(html).toContain(source.url);
      expect(html).toContain(source.capturedAt);
      expect(html).toContain('View full captured text');
    }
  });

  it('renders MediaTab with types, availability chips and demo material badges', () => {
    const html = renderToStaticMarkup(
      <MediaTab
        media={sourcesData.media}
        isLoading={false}
      />,
    );

    for (const item of sourcesData.media) {
      expect(html).toContain(item.title);
      expect(html).toContain(item.type);
      if (item.available) {
        expect(html).toContain('Available');
      } else {
        expect(html).toContain('Unavailable');
      }
      if (item.isDemo) {
        expect(html).toContain('Demo material');
      }
    }
  });

  it('renders trace results containing chunks, scores, mode/provider chips and required line', () => {
    const trace = traceData.response;
    expect(trace.mode).toBe('mock');
    expect(trace.provider).toBe('groq');
    expect(trace.modelId).toBe('qwen/qwen3.8-27b');
    expect(trace.chunks.length).toBeGreaterThan(0);
    expect(trace.chunks[0]!.score).toBe(4);
    expect(trace.chunks[0]!.source.title).toBe('VIP');
  });
});

