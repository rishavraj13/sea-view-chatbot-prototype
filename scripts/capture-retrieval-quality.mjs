import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import {
  retrieve,
  RETRIEVAL_THRESHOLD,
} from '../src/server/knowledge/index.ts';
const cases = z
  .array(z.object({ question: z.string(), expected: z.string().nullable() }))
  .parse(
    JSON.parse(await readFile('tests/fixtures/retrieval-quality.json', 'utf8')),
  );
const results = cases.map((item) => {
  const ranked = retrieve(item.question);
  const actual = ranked[0]?.source.title ?? null;
  return {
    ...item,
    actual,
    passed: actual === item.expected,
    chunks: ranked.map((c) => ({
      id: c.id,
      score: c.score,
      title: c.source.title,
      url: c.source.url,
    })),
  };
});
await mkdir('docs/examples/real-knowledge', { recursive: true });
await writeFile(
  'docs/examples/real-knowledge/retrieval-quality.json',
  JSON.stringify(
    {
      evidence: 'OFFLINE pure retrieval; zero provider calls',
      threshold: RETRIEVAL_THRESHOLD,
      total: results.length,
      passed: results.filter((r) => r.passed).length,
      results,
    },
    null,
    2,
  ),
);
console.log(
  `Retrieval quality: ${results.filter((r) => r.passed).length}/${results.length} passed; ${cases.filter((c) => c.expected === null).length} required no-matches; threshold=${RETRIEVAL_THRESHOLD}`,
);
if (results.some((r) => !r.passed)) throw Error('Retrieval quality failed');
