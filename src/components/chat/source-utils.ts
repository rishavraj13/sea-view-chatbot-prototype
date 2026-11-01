import type { PageSourceChip, SourceCitation } from './types';

/**
 * Deduplicate source citations by page and map to strict required labels:
 * - "Sea View Skydiving page"
 * - "Cancellations page"
 * Never uses chunk or section titles.
 */
export function deduplicateSourcesByPage(
  citations: readonly SourceCitation[],
): readonly PageSourceChip[] {
  const seenPages = new Set<string>();
  const chips: PageSourceChip[] = [];

  for (const citation of citations) {
    const rawUrl = citation.url || citation.sourceId || '';
    if (!rawUrl) continue;

    if (rawUrl.includes('/cancellations')) {
      if (!seenPages.has('cancellations')) {
        seenPages.add('cancellations');
        chips.push({
          pageKey: 'cancellations',
          label: 'Cancellations page',
          url: rawUrl,
        });
      }
    } else if (rawUrl.includes('/experiences/sea-view-skydiving') || rawUrl.includes('sea-view-skydiving')) {
      if (!seenPages.has('seaview')) {
        seenPages.add('seaview');
        chips.push({
          pageKey: 'seaview',
          label: 'Sea View Skydiving page',
          url: rawUrl,
        });
      }
    }
  }

  return chips;
}

