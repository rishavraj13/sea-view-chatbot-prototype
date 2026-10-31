import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { z } from 'zod';
import { DefaultChatTransport, readUIMessageStream } from 'ai';
import { readEnv } from '../src/server/config/env.ts';
const env = readEnv();
const key = {
  google: env.GOOGLE_GENERATIVE_AI_API_KEY,
  groq: env.GROQ_API_KEY,
  openrouter: env.OPENROUTER_API_KEY,
}[env.MODEL_PROVIDER];
if (env.MODEL_MODE !== 'live' || !key)
  throw Error('Configured live provider key is required');
const dir = 'docs/examples/phase17';
await mkdir(dir, { recursive: true });
const budgetSchema = z.object({
  google: z.number().int().min(0),
  groq: z.number().int().min(0),
  openrouter: z.number().int().min(0),
});
let budget = { google: 0, groq: 0, openrouter: 0 };
try {
  budget = budgetSchema.parse(
    JSON.parse(await readFile(`${dir}/budget.json`, 'utf8')),
  );
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
if (budget[env.MODEL_PROVIDER] !== 0)
  throw Error(
    'This provider already has task calls recorded; no automatic rerun',
  );
const calls = [];
const nativeFetch = globalThis.fetch;
const host = {
  google: 'generativelanguage.googleapis.com',
  groq: 'api.groq.com',
  openrouter: 'openrouter.ai',
}[env.MODEL_PROVIDER];
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.hostname !== host)
    throw Error('Unexpected provider host: request blocked');
  if (budget[env.MODEL_PROVIDER] >= 3)
    throw Error('Task inference budget exhausted');
  budget[env.MODEL_PROVIDER]++;
  await writeFile(`${dir}/budget.json`, JSON.stringify(budget, null, 2));
  const call = { number: budget[env.MODEL_PROVIDER], latencyMs: 0, status: 0 };
  calls.push(call);
  const start = performance.now();
  try {
    const response = await nativeFetch(input, init);
    call.status = response.status;
    if (env.MODEL_PROVIDER === 'google' && response.ok) {
      const usage = z
        .object({
          usageMetadata: z
            .object({
              thoughtsTokenCount: z.number().optional(),
              candidatesTokenCount: z.number().optional(),
            })
            .optional(),
        })
        .safeParse(await response.clone().json());
      if (usage.success) {
        call.reasoningTokens =
          usage.data.usageMetadata?.thoughtsTokenCount ?? 0;
        call.outputTokens = usage.data.usageMetadata?.candidatesTokenCount;
      }
    }
    return response;
  } finally {
    call.latencyMs = Math.round(performance.now() - start);
  }
};
const { POST } = await import('../src/app/api/chat/route.ts');
const { publicModelMetadata } = await import('../src/server/chat/index.ts');
const cases = [
  ['both', 'Send the brochure and show the video.'],
  ['info', 'What is the demo tandem price?'],
  ['unavailable', 'Send PDF brochure id retired.'],
];
const records = [];
for (const [index, [name, text]] of cases.entries()) {
  if (index) await new Promise((resolve) => setTimeout(resolve, 61000));
  const before = calls.length;
  const start = performance.now();
  const request = {
    messages: [{ id: name, role: 'user', parts: [{ type: 'text', text }] }],
  };
  const response = await POST(
    new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
  );
  const wire = await response.text();
  const record = {
    name,
    provider: env.MODEL_PROVIDER,
    modelId: publicModelMetadata().modelId,
    request,
    status: response.status,
    providerCalls: calls.length - before,
    calls: calls.slice(before),
    latencyMs: Math.round(performance.now() - start),
    wire,
  };
  if (response.ok) {
    const transport = new DefaultChatTransport({
      api: 'http://captured.invalid/api/chat',
      fetch: async () => new Response(wire, { headers: response.headers }),
    });
    const stream = await transport.sendMessages({
      trigger: 'submit-message',
      chatId: 'phase17',
      messages: request.messages,
      messageId: undefined,
    });
    for await (const message of readUIMessageStream({
      stream,
      terminateOnError: true,
    }))
      record.parsed = message;
  }
  records.push(record);
  await writeFile(
    `${dir}/live-${env.MODEL_PROVIDER}.json`,
    JSON.stringify(records, null, 2),
  );
  console.log(
    `${name}: ${env.MODEL_PROVIDER}, HTTP ${record.status}, provider calls=${record.providerCalls}, latency=${record.latencyMs}ms, tools=${
      record.parsed?.parts
        .filter((p) => p.type.startsWith('tool-'))
        .map((p) => p.type)
        .join(',') ?? 'none'
    }`,
  );
}
