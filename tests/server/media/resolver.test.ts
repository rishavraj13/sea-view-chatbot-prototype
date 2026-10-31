import { expect, it } from 'vitest';
import { resolveMedia, mediaResultSchema } from '../../../src/server/media';
it('resolves found, retired, unknown and wrong-type assets', () => {
  expect(resolveMedia('brochure', 'pdf').kind).toBe('brochure');
  expect(resolveMedia('retired', 'pdf').kind).toBe('unavailable');
  expect(resolveMedia('unknown', 'video').kind).toBe('unavailable');
  expect(resolveMedia('video', 'pdf').kind).toBe('unavailable');
});
it('validates discriminated tool payloads', () => {
  for (const [id, type] of [
    ['brochure', 'pdf'],
    ['video', 'video'],
    ['unknown', 'pdf'],
  ] as const)
    expect(mediaResultSchema.safeParse(resolveMedia(id, type)).success).toBe(
      true,
    );
  expect(mediaResultSchema.safeParse({ kind: 'video', id: 'v' }).success).toBe(
    false,
  );
});
it('keeps actual-video, generated-brochure and retired flags distinct', () => {
  expect(resolveMedia('video', 'video')).toMatchObject({
    isDemo: false,
    posterUrl:
      'https://www.greedyadventures.com/greedy/films/sea-view-studio-hero-poster.jpg',
  });
  expect(resolveMedia('brochure', 'pdf').isDemo).toBe(true);
  expect(resolveMedia('retired', 'pdf')).toMatchObject({
    kind: 'unavailable',
    isDemo: true,
  });
});
