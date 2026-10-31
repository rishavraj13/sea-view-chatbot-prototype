import { expect, it } from 'vitest';
import { z } from 'zod';
import pairs from '../../fixtures/attribution-quality.json';
import {
  attributeSources,
  measureSourceOverlap,
  sources,
  ATTRIBUTION_MIN_OVERLAP,
  ATTRIBUTION_MIN_WORDS,
} from '../../../src/server/knowledge';
import type { Chunk } from '../../../src/server/knowledge';
const fixtures = z
  .array(
    z.object({
      id: z.string(),
      answer: z.string(),
      source: z.string(),
      support: z.boolean(),
    }),
  )
  .parse(pairs);
const chunk = (title: string): Chunk => {
  const source = sources.find((s) => s.title === title)!;
  expect(source).toBeDefined();
  return { id: title, score: 1, text: source.text, source };
};
it.each(fixtures)('attribution evidence $id', (row) => {
  const candidate = chunk(row.source);
  expect(attributeSources(row.answer, [candidate]).length > 0).toBe(
    row.support,
  );
});
it('documents threshold evidence across 28 fixed answer/chunk pairs', () => {
  expect(fixtures).toHaveLength(28);
  expect(ATTRIBUTION_MIN_OVERLAP).toBe(0.5);
  expect(ATTRIBUTION_MIN_WORDS).toBe(2);
  const evidence = fixtures.map((row) => ({
    ...row,
    ...measureSourceOverlap(row.answer, chunk(row.source)),
  }));
  for (const threshold of [0.3, 0.4, 0.5, 0.6, 0.7, 0.8]) {
    const positive = evidence.filter(
      (row) => row.matchedWords.length >= 2 && row.overlap >= threshold,
    );
    if (threshold === 0.5) {
      expect(positive.filter((row) => !row.support)).toHaveLength(0);
      expect(positive).toHaveLength(17);
    }
    if (threshold <= 0.4)
      expect(positive.some((row) => !row.support)).toBe(true);
    if (threshold > 0.5)
      expect(positive.filter((row) => row.support).length).toBeLessThan(17);
  }
});
it('ranks by overlap, deduplicates URL, returns at most two and does not mutate inputs', () => {
  const candidates = [
    chunk('ECO'),
    chunk("What's included"),
    chunk('VIP'),
    chunk('DELUXE'),
  ];
  const before = structuredClone(candidates);
  const selected = attributeSources(
    'Tandem skydive, safety briefing, certificate of completion.',
    candidates,
  );
  expect(selected).toHaveLength(2);
  expect(new Set(selected.map((c) => c.source.url)).size).toBe(selected.length);
  const scores = selected.map(
    (c) =>
      measureSourceOverlap(
        'Tandem skydive, safety briefing, certificate of completion.',
        c,
      ).overlap,
  );
  expect(scores).toEqual([...scores].sort((a, b) => b - a));
  expect(candidates).toEqual(before);
});
it('a model URL contributes no evidence and question words alone are insufficient', () => {
  const candidate = chunk('VIP');
  expect(attributeSources(candidate.source.url, [candidate])).toEqual([]);
  expect(
    attributeSources('Who what where when why how which?', [candidate]),
  ).toEqual([]);
  expect(
    measureSourceOverlap(
      `VIP costs ฿14,000. ${candidate.source.url}`,
      candidate,
    ),
  ).toEqual(measureSourceOverlap('VIP costs ฿14,000.', candidate));
});
