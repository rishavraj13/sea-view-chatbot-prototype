import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { z } from 'zod';
import { DefaultChatTransport, readUIMessageStream } from 'ai';
import { readEnv } from '../src/server/config/index.ts';
import { POST } from '../src/app/api/chat/route.ts';
import { evaluateGrounding } from '../src/server/chat/index.ts';
import {
  buildRetrievalQuery,
  retrieve,
} from '../src/server/knowledge/index.ts';

const env = readEnv();
if (
  env.MODEL_MODE !== 'live' ||
  env.MODEL_PROVIDER !== 'groq' ||
  env.MODEL_ID !== 'qwen/qwen3.8-27b' ||
  !env.GROQ_API_KEY
)
  throw Error('Explicit live Groq Qwen configuration and key required');
const dir = 'docs/examples/live-provider';
await mkdir(dir, { recursive: true });
try {
  await readFile(`${dir}/budget.json`);
  throw Error('Four-call task budget already allocated; no rerun');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
await writeFile(
  `${dir}/budget.json`,
  JSON.stringify({ provider: 'groq', maximum: 4, calls: 0 }, null, 2),
);
const replySchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string().nullable().optional(),
        tool_calls: z
          .array(
            z.object({
              id: z.string(),
              type: z.literal('function'),
              function: z.object({ name: z.string(), arguments: z.string() }),
            }),
          )
          .optional(),
      }),
    }),
  ),
});
let totalCalls = 0;
let observed = null;
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (
    url.hostname !== 'api.groq.com' ||
    url.pathname !== '/openai/v1/chat/completions' ||
    totalCalls >= 4
  )
    throw Error('Groq-only four-call budget restriction');
  totalCalls++;
  await writeFile(
    `${dir}/budget.json`,
    JSON.stringify(
      { provider: 'groq', maximum: 4, calls: totalCalls },
      null,
      2,
    ),
  );
  const start = performance.now();
  const response = await nativeFetch(input, init);
  const body = response.ok
    ? replySchema.parse(await response.clone().json())
    : null;
  observed = {
    status: response.status,
    latencyMs: Math.round(performance.now() - start),
    rawAnswer: body?.choices[0]?.message.content ?? '',
    toolCalls: body?.choices[0]?.message.tool_calls ?? [],
    limits: {
      rpd: response.headers.get('x-ratelimit-limit-requests'),
      tpm: response.headers.get('x-ratelimit-limit-tokens'),
    },
  };
  return response;
};
const records = [];
let vipHistory = [];
for (const [index, question] of [
  'What if it rains?',
  'How much is the VIP package?',
  'Send me the brochure and a video',
  "and what's included?",
].entries()) {
  if (index) await new Promise((resolve) => setTimeout(resolve, 25000));
  const messages = [
    ...(index === 3 ? vipHistory : []),
    {
      id: `groq-user-${index}`,
      role: 'user',
      parts: [{ type: 'text', text: question }],
    },
  ];
  observed = null;
  const before = totalCalls;
  const start = performance.now();
  let wire = '';
  let httpStatus = 0;
  const transport = new DefaultChatTransport({
    api: 'http://localhost/api/chat',
    fetch: async (input, init) => {
      const response = await POST(new Request(String(input), init));
      httpStatus = response.status;
      wire = await response.clone().text();
      return response;
    },
  });
  let message;
  try {
    const stream = await transport.sendMessages({
      trigger: 'submit-message',
      chatId: `groq-${index}`,
      messages,
      messageId: undefined,
      abortSignal: undefined,
    });
    for await (const value of readUIMessageStream({ stream })) message = value;
  } catch {
    // Store only the route's sanitized error response, never upstream error bodies.
  }
  if (index === 1) vipHistory = [...messages, ...(message ? [message] : [])];
  const chunks = retrieve(buildRetrievalQuery(messages));
  const record = {
    evidence:
      'LIVE Groq through actual /api/chat handler and SDK transport; no separate trace/model call',
    question,
    request: { messages },
    provider: 'groq',
    modelId: env.MODEL_ID,
    status: httpStatus,
    providerCalls: totalCalls - before,
    latencyMs: Math.round(performance.now() - start),
    providerResponse: observed,
    guard: observed?.rawAnswer
      ? evaluateGrounding(observed.rawAnswer, chunks)
      : null,
    retrievalQuery: buildRetrievalQuery(messages),
    visibleText:
      message?.parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text)
        .join('') ?? '',
    citations: message?.parts.filter((p) => p.type === 'source-url') ?? [],
    toolResults: message?.parts.filter((p) => p.type.startsWith('tool-')) ?? [],
    wire,
  };
  records.push(record);
  await writeFile(`${dir}/groq.json`, JSON.stringify(records, null, 2));
  console.log(
    JSON.stringify({ ...record, request: undefined, wire: undefined }, null, 2),
  );
}
