import { SOURCE_PAGES } from '@/content';
import type { PageSourceChip } from './types';
import { sourceSchema } from './schemas';

/** Page identity uses exact origin/path matching; section fragments share one chip. */
export function deduplicateSourcesByPage(
  citations: readonly unknown[],
): readonly PageSourceChip[] {
  const chips: PageSourceChip[] = [];
  for (const value of citations) {
    const parsed = sourceSchema.safeParse(value);
    if (!parsed.success) continue;
    const url = new URL(parsed.data.url);
    if (url.username || url.password) continue;
    const page = SOURCE_PAGES.find(
      (entry) => entry.origin === url.origin && entry.pathname === url.pathname,
    );
    if (!page || chips.some((chip) => chip.pageKey === page.pageKey)) continue;
    chips.push({
      pageKey: page.pageKey,
      label: page.label,
      url: parsed.data.url,
    });
  }
  return chips;
}
