import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { performance } from 'node:perf_hooks';
import { POST } from '../src/app/api/chat/route.ts';
import { readEnv } from '../src/server/config/env.ts';
const env = readEnv();
if (
  env.MODEL_MODE !== 'live' ||
  env.MODEL_PROVIDER !== 'google' ||
  !env.GOOGLE_GENERATIVE_AI_API_KEY
)
  throw Error('Original Google live configuration required');
const dir = 'docs/examples/covered-info';
await mkdir(dir, { recursive: true });
const baseline = z
  .object({
    question: z.string(),
    trace: z.object({ chunks: z.array(z.unknown()), context: z.string() }),
  })
  .parse(JSON.parse(await readFile(`${dir}/offline-before.json`, 'utf8')));
if (!baseline.trace.chunks.length)
  throw Error('Offline retrieval must succeed before spending the live call');
try {
  await readFile(`${dir}/live-budget.json`);
  throw Error('Diagnostic live call already allocated; no rerun');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
let calls = 0;
let modelText = '';
let elapsedProviderMs = 0;
const native = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  if (calls >= 1) throw Error('Single diagnostic inference budget exceeded');
  calls++;
  await writeFile(
    `${dir}/live-budget.json`,
    JSON.stringify({ google: calls, maximum: 1 }, null, 2),
  );
  const start = performance.now();
  const response = await native(input, init);
  elapsedProviderMs = Math.round(performance.now() - start);
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
    modelText = (body.candidates?.[0]?.content?.parts ?? [])
      .filter((p) => !p.thought)
      .map((p) => p.text ?? '')
      .join('');
  }
  return response;
};
const start = performance.now();
const response = await POST(
  new Request('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages: [
        {
          id: 'exact-info',
          role: 'user',
          parts: [{ type: 'text', text: baseline.question }],
        },
      ],
    }),
  }),
);
const record = {
  question: baseline.question,
  evidence: 'LIVE original answering pipeline, before fixes',
  provider: 'google',
  modelId: env.MODEL_ID ?? env.GOOGLE_MODEL,
  providerCalls: calls,
  providerLatencyMs: elapsedProviderMs,
  totalLatencyMs: Math.round(performance.now() - start),
  status: response.status,
  modelText,
  wire: await response.text(),
};
await writeFile(`${dir}/live-before.json`, JSON.stringify(record, null, 2));
console.log(JSON.stringify(record, null, 2));
