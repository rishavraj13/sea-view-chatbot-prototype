import { describe, expect, it } from 'vitest';
import { passageProgress, scrollProgress } from '@/components/scroll/progress';

describe('pure scroll position progress', () => {
  it.each([
    [-1, 0],
    [0, 0],
    [500, 0.5],
    [1000, 1],
    [1001, 1],
  ])('pin at offset %s', (offset, expected) => {
    expect(
      scrollProgress({
        scrollY: 100 + offset,
        top: 100,
        height: 1800,
        viewport: 800,
      }),
    ).toBe(expected);
  });
  it.each([
    [-801, 0],
    [-800, 0],
    [-200, 0.5],
    [400, 1],
    [401, 1],
  ])('passage at offset %s', (offset, expected) => {
    expect(
      passageProgress({
        scrollY: 1000 + offset,
        top: 1000,
        height: 400,
        viewport: 800,
      }),
    ).toBe(expected);
  });
  it.each([scrollProgress, passageProgress])(
    'handles zero-height and unusable viewport geometry',
    (progress) => {
      expect(progress({ scrollY: 100, top: 0, height: 0, viewport: 800 })).toBe(
        0,
      );
      expect(progress({ scrollY: 100, top: 0, height: 500, viewport: 0 })).toBe(
        0,
      );
    },
  );
  it('does not pin a section shorter than the viewport', () => {
    expect(
      scrollProgress({ scrollY: 1000, top: 0, height: 500, viewport: 800 }),
    ).toBe(0);
  });
});
