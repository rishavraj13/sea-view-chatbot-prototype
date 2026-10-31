import { expect, it } from 'vitest';
import { z } from 'zod';
import cases from '../../fixtures/retrieval-quality.json';
import { retrieve, RETRIEVAL_THRESHOLD } from '../../../src/server/knowledge';
const suite = z
  .array(z.object({ question: z.string(), expected: z.string().nullable() }))
  .parse(cases);
it.each(suite)(
  'customer retrieval: $question -> $expected',
  ({ question, expected }) => {
    const results = retrieve(question);
    if (expected === null) expect(results).toEqual([]);
    else expect(results[0]?.source.title).toBe(expected);
    expect(results.every((c) => c.score >= RETRIEVAL_THRESHOLD)).toBe(true);
  },
);
it('keeps the evidence threshold at 1', () =>
  expect(RETRIEVAL_THRESHOLD).toBe(1));
