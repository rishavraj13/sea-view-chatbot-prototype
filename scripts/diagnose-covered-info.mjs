import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { z } from 'zod';
import { POST } from '../src/app/api/knowledge/trace/route.ts';
import {
  buildRetrievalQuery,
  RETRIEVAL_THRESHOLD,
} from '../src/server/knowledge/index.ts';
const stage = z.enum(['before', 'after']).parse(process.argv[2] ?? 'after');
if (stage === 'before')
  try {
    await access('docs/examples/covered-info/offline-before.json');
    throw Error('Historical baseline already exists; use after');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
const historical = z
  .array(
    z.object({
      name: z.string(),
      request: z.object({
        messages: z.array(
          z.object({
            id: z.string(),
            role: z.enum(['user', 'assistant']),
            parts: z.array(
              z.object({ type: z.literal('text'), text: z.string() }),
            ),
          }),
        ),
      }),
    }),
  )
  .parse(
    JSON.parse(
      await readFile('docs/examples/phase17/live-google.json', 'utf8'),
    ),
  );
const failed = historical.find((r) => r.name === 'info');
if (!failed) throw Error('Failed question missing');
const question = failed.request.messages
  .at(-1)
  .parts.map((p) => p.text)
  .join('\n');
let providerCalls = 0;
globalThis.fetch = async () => {
  providerCalls++;
  throw Error('Offline diagnosis forbids provider calls');
};
const response = await POST(
  new Request('http://localhost/api/knowledge/trace', {
    method: 'POST',
    body: JSON.stringify({ question, messages: failed.request.messages }),
  }),
);
const trace = await response.json();
if (trace.mode !== 'mock' || response.status !== 200 || providerCalls !== 0)
  throw Error('Expected offline mock trace');
const record = {
  evidence: 'OFFLINE MOCK trace route; no provider generation',
  question,
  retrievalQuery: buildRetrievalQuery(failed.request.messages),
  threshold: RETRIEVAL_THRESHOLD,
  providerCalls,
  status: response.status,
  trace,
};
await mkdir('docs/examples/covered-info', { recursive: true });
await writeFile(
  `docs/examples/covered-info/offline-${stage}.json`,
  JSON.stringify(record, null, 2),
);
console.log(JSON.stringify(record, null, 2));
