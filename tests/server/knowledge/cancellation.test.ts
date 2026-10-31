import { expect, it } from 'vitest';
import captured from '../../fixtures/cancellation-before-split.json';
import { z } from 'zod';
import { sources, retrieve } from '../../../src/server/knowledge';
it('split cancellation records concatenate to the original captured page text without changing facts', () => {
  const original = z
    .object({
      text: z.string(),
      url: z.url(),
      capturedAt: z.string(),
      isDemo: z.boolean(),
    })
    .parse(captured);
  const paragraphs = [
    'Single-day activities',
    'Courses',
    'Multi-day trips and camps',
    'How to cancel',
  ].map((title) => sources.find((source) => source.title === title)!);
  expect(paragraphs.map((source) => source.text).join('\n')).toBe(
    original.text,
  );
  for (const source of paragraphs)
    expect({
      url: source.url,
      capturedAt: source.capturedAt,
      isDemo: source.isDemo,
    }).toEqual({
      url: original.url,
      capturedAt: original.capturedAt,
      isDemo: original.isDemo,
    });
});
it('procedural cancellation tie prefers the how-to paragraph without altering numeric scores', () => {
  const chunks = retrieve('How do I cancel a tandem?');
  expect(chunks[0]?.source.title).toBe('How to cancel');
  expect(chunks[0]?.score).toBe(2);
  expect(chunks[1]?.score).toBe(2);
});
