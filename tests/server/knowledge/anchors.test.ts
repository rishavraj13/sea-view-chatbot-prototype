import { expect, it } from 'vitest';
import { z } from 'zod';
import capture from '../../../docs/examples/citations/anchor-capture.json';
import { sources } from '../../../src/server/knowledge';

it('every source fragment is an actual element id captured from its public page HTML', () => {
  const verified = z
    .object({
      checkedAt: z.iso.date(),
      pages: z
        .array(
          z.object({
            url: z.url(),
            status: z.literal(200),
            htmlSha256: z.string().regex(/^[a-f0-9]{64}$/),
            elementIds: z.array(z.string()),
          }),
        )
        .length(2),
    })
    .parse(capture);
  for (const source of sources) {
    const url = new URL(source.url);
    const fragment = decodeURIComponent(url.hash.slice(1));
    url.hash = '';
    const page = verified.pages.find((item) => item.url === url.href);
    expect(page, source.url).toBeDefined();
    if (fragment) expect(page!.elementIds, source.url).toContain(fragment);
  }
  const cancellation = sources.filter((source) =>
    [
      'Single-day activities',
      'Courses',
      'Multi-day trips and camps',
      'How to cancel',
    ].includes(source.title),
  );
  expect(cancellation).toHaveLength(4);
  expect(new Set(cancellation.map((source) => source.url))).toEqual(
    new Set(['https://www.greedyadventures.com/cancellations#page-content']),
  );
});
