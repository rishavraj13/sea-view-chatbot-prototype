import { describe, expect, it } from 'vitest';
import manifest from '../../data/media/manifest.json';
import { toolOutputSchema } from '@/components/chat/schemas';
import { deduplicateSourcesByPage } from '@/components/chat/source-utils';
import { responseMode } from '@/components/chat/mode';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { MediaPart } from '@/components/chat/ChatMessage';

describe('Validated rendering and latest mode', () => {
  it('renders no tool UI for an invalid result', () => {
    expect(
      renderToStaticMarkup(
        createElement(MediaPart, {
          result: { kind: 'brochure', url: 'javascript:alert(1)' },
        }),
      ),
    ).toBe('');
  });
  it.each(['brochure', 'video'] as const)(
    'accepts the registered %s result',
    (kind) => {
      const asset = manifest.find((item) => item.id === kind)!;
      expect(toolOutputSchema.safeParse({ ...asset, kind }).success).toBe(true);
    },
  );
  it('accepts unavailable but rejects malformed/unsafe media', () => {
    expect(
      toolOutputSchema.safeParse({
        kind: 'unavailable',
        id: 'x',
        title: 'File',
        url: '',
        isDemo: false,
        reason: 'unknown',
      }).success,
    ).toBe(true);
    for (const value of [
      null,
      {},
      {
        kind: 'video',
        id: 'x',
        title: 'File',
        url: 'javascript:alert(1)',
        isDemo: false,
        type: 'video',
      },
    ])
      expect(toolOutputSchema.safeParse(value).success).toBe(false);
  });
  it.each([
    'https://www.greedyadventures.com.evil.test/cancellations',
    'https://evil.test/experiences/sea-view-skydiving',
    'https://www.greedyadventures.com/other/cancellations',
    'http://www.greedyadventures.com/cancellations',
    'https://name@www.greedyadventures.com/cancellations',
  ])('rejects an allow-list lookalike: %s', (url) => {
    expect(
      deduplicateSourcesByPage([{ type: 'source-url', sourceId: url, url }]),
    ).toEqual([]);
  });
  it('derives live/mock from the latest response and clears on an empty thread', () => {
    const message = (mode: 'mock' | 'live') => ({
      id: mode,
      role: 'assistant' as const,
      parts: [],
      metadata: { mode },
    });
    expect(responseMode([message('mock')])).toBe('mock');
    expect(responseMode([message('mock'), message('live')])).toBe('live');
    expect(responseMode([])).toBeUndefined();
    expect(
      responseMode([message('mock')], { code: 'TIMEOUT', mode: 'live' }),
    ).toBe('live');
  });
});
