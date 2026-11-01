import { describe, expect, it } from 'vitest';
import { deduplicateSourcesByPage } from '@/components/chat/source-utils';
import type { SourceCitation } from '@/components/chat/types';

describe('Chat sources deduplication and labelling', () => {
  it('deduplicates multiple anchors from the same page into a single page chip', () => {
    const citations: SourceCitation[] = [
      {
        type: 'source-url',
        sourceId: 'https://www.greedyadventures.com/experiences/sea-view-skydiving#options',
        url: 'https://www.greedyadventures.com/experiences/sea-view-skydiving#options',
        title: 'VIP',
      },
      {
        type: 'source-url',
        sourceId: 'https://www.greedyadventures.com/experiences/sea-view-skydiving#faqs',
        url: 'https://www.greedyadventures.com/experiences/sea-view-skydiving#faqs',
        title: 'Which package should I choose?',
      },
      {
        type: 'source-url',
        sourceId: 'https://www.greedyadventures.com/cancellations#page-content',
        url: 'https://www.greedyadventures.com/cancellations#page-content',
        title: 'Single-day activities',
      },
    ];

    const chips = deduplicateSourcesByPage(citations);
    expect(chips).toHaveLength(2);
    expect(chips[0]!.label).toBe('Sea View Skydiving page');
    expect(chips[1]!.label).toBe('Cancellations page');
  });

  it('never labels chips by section title', () => {
    const citations: SourceCitation[] = [
      {
        type: 'source-url',
        sourceId: 'https://www.greedyadventures.com/experiences/sea-view-skydiving#options',
        url: 'https://www.greedyadventures.com/experiences/sea-view-skydiving#options',
        title: 'Section title that must be ignored',
      },
    ];

    const chips = deduplicateSourcesByPage(citations);
    expect(chips[0]!.label).toBe('Sea View Skydiving page');
    expect(chips[0]!.label).not.toContain('Section title');
  });
});

