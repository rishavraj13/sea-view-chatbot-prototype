import { expect, it } from 'vitest';
import { summarizeMedia } from '../../../src/server/chat';
import { resolveMedia, registry } from '../../../src/server/media';

it('uses isDemo once and keeps URLs in tool payloads, not visible summaries', () => {
  for (const asset of registry) expect(asset.title).not.toMatch(/\bDEMO\b/i);
  const demo = summarizeMedia([resolveMedia('brochure', 'pdf')]);
  expect(demo).toBe('Here is the brochure (demo material).');
  expect(demo.match(/\(demo material\)/g)).toHaveLength(1);
  expect(demo).not.toContain('/demo/');
  const found = summarizeMedia([resolveMedia('video', 'video')]);
  expect(found).toBe('Here is the video.');
  expect(found).toContain('Here is');
  expect(found).not.toMatch(/demo material|https?:/);
});
it('uses customer-safe unavailable and unknown wording', () => {
  expect(resolveMedia('unknown', 'pdf').title).toBe('Requested file');
  expect(summarizeMedia([resolveMedia('retired', 'pdf')])).toBe(
    "That file isn't available right now.",
  );
  expect(summarizeMedia([resolveMedia('unknown', 'pdf')])).toBe(
    "That file isn't available right now.",
  );
  expect(summarizeMedia([resolveMedia('video', 'pdf')])).toBe(
    "That file isn't available right now.",
  );
  expect(
    summarizeMedia([
      { ...resolveMedia('brochure', 'pdf'), title: 'INTERNAL title to ignore' },
    ]),
  ).toBe('Here is the brochure (demo material).');
});
