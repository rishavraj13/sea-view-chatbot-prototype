import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { z } from 'zod';
import { readEnv } from '../src/server/config/env.ts';
import { POST } from '../src/app/api/chat/route.ts';
import { evaluateGrounding } from '../src/server/chat/index.ts';
import {
  retrieve,
  buildRetrievalQuery,
} from '../src/server/knowledge/index.ts';
const env = readEnv();
if (
  env.MODEL_MODE !== 'live' ||
  env.MODEL_PROVIDER !== 'google' ||
  !env.GOOGLE_GENERATIVE_AI_API_KEY
)
  throw Error('Google live configuration required');
const dir = 'docs/examples/real-knowledge';
await mkdir(dir, { recursive: true });
try {
  await readFile(`${dir}/live-budget.json`);
  throw Error('Two-call task already allocated; no rerun');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
let calls = 0;
let rawAnswer = '';
let providerLatencyMs = 0;
const native = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.hostname !== 'generativelanguage.googleapis.com' || calls >= 2)
    throw Error('Live budget/provider restriction');
  calls++;
  await writeFile(
    `${dir}/live-budget.json`,
    JSON.stringify({ google: calls, maximum: 2 }, null, 2),
  );
  const start = performance.now();
  const response = await native(input, init);
  providerLatencyMs = Math.round(performance.now() - start);
  if (response.ok) {
    const body = z
      .object({
        candidates: z
          .array(
            z.object({
              content: z
                .object({
                  parts: z.array(
                    z.object({
                      text: z.string().optional(),
                      thought: z.boolean().optional(),
                    }),
                  ),
                })
                .optional(),
            }),
          )
          .optional(),
      })
      .parse(await response.clone().json());
    rawAnswer = (body.candidates?.[0]?.content?.parts ?? [])
      .filter((p) => !p.thought)
      .map((p) => p.text ?? '')
      .join('');
  }
  return response;
};
const records = [];
for (const [i, question] of [
  'How much is the VIP package?',
  'What if it rains?',
].entries()) {
  if (i) await new Promise((resolve) => setTimeout(resolve, 61000));
  rawAnswer = '';
  const before = calls;
  const start = performance.now();
  const messages = [
    {
      id: `real-${i}`,
      role: 'user',
      parts: [{ type: 'text', text: question }],
    },
  ];
  const response = await POST(
    new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),
  );
  const record = {
    question,
    evidence: 'LIVE Google, actual chat handler and provider HTTP call',
    status: response.status,
    callCount: calls - before,
    providerLatencyMs,
    latencyMs: Math.round(performance.now() - start),
    rawAnswer,
    guard: rawAnswer
      ? evaluateGrounding(rawAnswer, retrieve(buildRetrievalQuery(messages)))
      : null,
    wire: await response.text(),
  };
  records.push(record);
  await writeFile(`${dir}/live-google.json`, JSON.stringify(records, null, 2));
  console.log(JSON.stringify(record, null, 2));
}
