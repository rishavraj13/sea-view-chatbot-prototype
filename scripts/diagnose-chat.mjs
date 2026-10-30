import { performance } from 'node:perf_hooks';
import { mkdir, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { readEnv } from '../src/server/config/env.ts';

const settings = readEnv();
if (settings.MODEL_MODE !== 'live' || !settings.GOOGLE_GENERATIVE_AI_API_KEY)
  throw Error('Live configuration required');
const calls = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.hostname !== 'generativelanguage.googleapis.com')
    return originalFetch(input, init);
  const call = {
    number: calls.length + 1,
    model: settings.GOOGLE_MODEL,
    status: 0,
    latencyMs: 0,
  };
  calls.push(call);
  const start = performance.now();
  try {
    const response = await originalFetch(input, init);
    call.status = response.status;
    if (response.status === 429) {
      const quotaSchema = z.object({
        error: z.object({
          details: z
            .array(
              z.object({
                violations: z
                  .array(
                    z.object({
                      quotaMetric: z.string().optional(),
                      quotaId: z.string().optional(),
                      quotaValue: z.string().optional(),
                    }),
                  )
                  .optional(),
                retryDelay: z.string().optional(),
              }),
            )
            .optional(),
        }),
      });
      const parsed = quotaSchema.safeParse(await response.clone().json());
      if (parsed.success) call.quota = parsed.data.error.details;
    }
    return response;
  } finally {
    call.latencyMs = Math.round(performance.now() - start);
  }
};
const { POST } = await import('../src/app/api/chat/route.ts');
const start = performance.now();
const response = await POST(
  new Request('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages: [
        {
          id: 'diagnosis',
          role: 'user',
          parts: [
            { type: 'text', text: 'Send the brochure and show the video.' },
          ],
        },
      ],
    }),
  }),
);
const output = {
  model: settings.GOOGLE_MODEL,
  providerCalls: calls.length,
  calls,
  status: response.status,
  totalLatencyMs: Math.round(performance.now() - start),
  response: await response.text(),
};
await mkdir('docs/examples/verification', { recursive: true });
await writeFile(
  'docs/examples/verification/provider-diagnosis.json',
  JSON.stringify(output, null, 2),
);
console.log(
  JSON.stringify(
    {
      model: output.model,
      providerCalls: output.providerCalls,
      calls,
      status: output.status,
      totalLatencyMs: output.totalLatencyMs,
    },
    null,
    2,
  ),
);
