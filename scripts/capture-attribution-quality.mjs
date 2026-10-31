import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { dirname } from 'node:path';
import {
  sources,
  measureSourceOverlap,
  ATTRIBUTION_MIN_OVERLAP,
  ATTRIBUTION_MIN_WORDS,
} from '../src/server/knowledge/index.ts';
const fixtures = z
  .array(
    z.object({
      id: z.string(),
      answer: z.string(),
      source: z.string(),
      support: z.boolean(),
    }),
  )
  .parse(
    JSON.parse(
      await readFile('tests/fixtures/attribution-quality.json', 'utf8'),
    ),
  );
const matrix = fixtures.map((row) => {
  const source = sources.find((s) => s.title === row.source);
  if (!source) throw Error('Missing fixture source');
  const overlap = measureSourceOverlap(row.answer, {
    id: source.title,
    score: 1,
    text: source.text,
    source,
  });
  return {
    ...row,
    ...overlap,
    actual:
      overlap.matchedWords.length >= ATTRIBUTION_MIN_WORDS &&
      overlap.overlap >= ATTRIBUTION_MIN_OVERLAP,
  };
});
const candidates = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map((threshold) => ({
  threshold,
  falsePositives: matrix.filter(
    (row) =>
      !row.support && row.matchedWords.length >= 2 && row.overlap >= threshold,
  ).length,
  falseNegatives: matrix.filter(
    (row) =>
      row.support &&
      !(row.matchedWords.length >= 2 && row.overlap >= threshold),
  ).length,
}));
const evidence = {
  evidence: 'OFFLINE lexical calibration; zero provider calls',
  metric:
    'intersection size / min(answer content-word count, chunk content-word count)',
  minimumWords: ATTRIBUTION_MIN_WORDS,
  threshold: ATTRIBUTION_MIN_OVERLAP,
  choice:
    'Highest tested threshold retaining all 17 positive pairs with zero false positives among 11 negative pairs. Includes an explicit function-word-only negative. This is fixture calibration, not semantic validation.',
  candidates,
  matrix,
};
const args = z.array(z.string().min(1)).max(1).parse(process.argv.slice(2));
const destination =
  args[0] ?? 'docs/examples/source-attribution/quality-evidence.json';
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, JSON.stringify(evidence, null, 2));
console.log(
  JSON.stringify(
    {
      pairs: matrix.length,
      passed: matrix.filter((row) => row.support === row.actual).length,
      threshold: ATTRIBUTION_MIN_OVERLAP,
      minimumWords: ATTRIBUTION_MIN_WORDS,
      candidates,
    },
    null,
    2,
  ),
);
