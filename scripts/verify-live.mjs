import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { z } from 'zod';
import { DefaultChatTransport, readUIMessageStream } from 'ai';
import { readEnv } from '../src/server/config/index.ts';
import { POST } from '../src/app/api/chat/route.ts';
import {
  chatRequestSchema,
  evaluateGrounding,
} from '../src/server/chat/index.ts';
import {
  retrieve,
  buildRetrievalQuery,
} from '../src/server/knowledge/index.ts';
import { scenarios, checkScenario } from './live-scenarios.mjs';

const args = z
  .array(z.enum(['--failures', '--resume']))
  .max(1)
  .parse(process.argv.slice(2));
const attempt = args.includes('--failures') ? 'rerun' : 'initial';
const resume = args.includes('--resume');
const env = readEnv();
if (
  env.MODEL_MODE !== 'live' ||
  env.MODEL_PROVIDER !== 'groq' ||
  !env.GROQ_API_KEY ||
  !env.MODEL_ID
)
  throw Error('Explicit live Groq configuration and key required');
const dir = join('docs', 'examples', 'media-gating');
await mkdir(dir, { recursive: true });
const ledgerPath = join(dir, 'live-budget.json');
const ledgerSchema = z.object({
  calls: z.number().int().min(0).max(40),
  lastCallAt: z.number(),
  stopped429: z.boolean(),
  runs: z.array(z.string()),
});
let ledger;
try {
  ledger = ledgerSchema.parse(JSON.parse(await readFile(ledgerPath, 'utf8')));
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
  ledger = { calls: 0, lastCallAt: 0, stopped429: false, runs: [] };
}
if (ledger.stopped429)
  throw Error('Campaign stopped on 429; no further calls allowed');
const modelSlug = env.MODEL_ID.replace(/[^a-zA-Z0-9_-]/g, '-');
const runKey = `${modelSlug}-${attempt}`;
if (ledger.runs.includes(runKey) && !resume)
  throw Error('This model/attempt already ran; no duplicate run');
const recordsPath = join(dir, `${runKey}.json`);
const initialPath = join(dir, `${modelSlug}-initial.json`);
const previous =
  attempt === 'rerun' || resume
    ? z
        .array(
          z.looseObject({
            id: z.string(),
            passed: z.boolean(),
            request: chatRequestSchema,
            message: z.unknown().optional(),
          }),
        )
        .parse(JSON.parse(await readFile(initialPath, 'utf8')))
    : [];
const selected =
  attempt === 'rerun'
    ? scenarios.filter((s) => previous.some((r) => r.id === s.id && !r.passed))
    : resume
      ? scenarios.filter((s) => !previous.some((r) => r.id === s.id))
      : scenarios;
if (!selected.length) {
  console.log('No failed scenarios to rerun.');
  process.exit(0);
}
if (!ledger.runs.includes(runKey)) ledger.runs.push(runKey);
const saveLedger = () => writeFile(ledgerPath, JSON.stringify(ledger, null, 2));
await saveLedger();
const reply = z.object({
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
let observed;
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (
    url.hostname !== 'api.groq.com' ||
    url.pathname !== '/openai/v1/chat/completions' ||
    ledger.calls >= 40 ||
    ledger.stopped429
  )
    throw Error('Groq-only campaign budget restriction');
  const pause = 3100 - (Date.now() - ledger.lastCallAt);
  if (pause > 0) await new Promise((resolve) => setTimeout(resolve, pause));
  ledger.calls++;
  ledger.lastCallAt = Date.now();
  await saveLedger();
  const started = performance.now();
  const startedAt = new Date().toISOString();
  const response = await nativeFetch(input, init);
  if (response.status === 429) {
    ledger.stopped429 = true;
    await saveLedger();
  }
  const body = response.ok ? reply.parse(await response.clone().json()) : null;
  observed = {
    status: response.status,
    startedAt,
    latencyMs: Math.round(performance.now() - started),
    rawAnswer: body?.choices[0]?.message.content ?? '',
    rawToolCalls: body?.choices[0]?.message.tool_calls ?? [],
  };
  return response;
};
const records = resume ? [...previous] : [];
let vipHistory = [];
if (attempt === 'rerun' || resume) {
  const vip = previous.find((r) => r.id === 'vip');
  if (vip)
    vipHistory = [
      ...vip.request.messages,
      ...(vip.message ? [vip.message] : []),
    ];
}
for (const scenario of selected) {
  if (ledger.calls >= 40 || ledger.stopped429) break;
  const user = {
    id: `${runKey}-${scenario.id}`,
    role: 'user',
    parts: [{ type: 'text', text: scenario.question }],
  };
  const request = chatRequestSchema.parse({
    messages: [...(scenario.id === 'follow-up' ? vipHistory : []), user],
  });
  if (scenario.id === 'follow-up' && !vipHistory.length)
    throw Error('No captured VIP history for dependent follow-up');
  const before = ledger.calls;
  observed = null;
  let status = 0,
    wire = '',
    message;
  const started = performance.now();
  const transport = new DefaultChatTransport({
    api: 'http://localhost/api/chat',
    fetch: async (input, init) => {
      const response = await POST(new Request(String(input), init));
      status = response.status;
      wire = await response.clone().text();
      return response;
    },
  });
  try {
    const stream = await transport.sendMessages({
      trigger: 'submit-message',
      chatId: runKey,
      messages: request.messages,
      messageId: undefined,
      abortSignal: undefined,
    });
    for await (const value of readUIMessageStream({ stream })) message = value;
  } catch {
    /* Only the sanitized route response is recorded, not upstream error bodies. */
  }
  if (scenario.id === 'vip')
    vipHistory = [...request.messages, ...(message ? [message] : [])];
  const chunks = retrieve(buildRetrievalQuery(request.messages));
  const record = {
    id: scenario.id,
    question: scenario.question,
    attempt,
    evidence:
      'LIVE Groq via actual chat route and SDK transport; no separate trace/model call',
    modelId: env.MODEL_ID,
    request,
    message,
    status,
    providerCalls: ledger.calls - before,
    providerStatus: observed?.status ?? null,
    providerStartedAt: observed?.startedAt ?? null,
    latencyMs: Math.round(performance.now() - started),
    providerLatencyMs: observed?.latencyMs ?? null,
    rawAnswer: observed?.rawAnswer ?? '',
    rawToolCalls: observed?.rawToolCalls ?? [],
    citations: message?.parts.filter((p) => p.type === 'source-url') ?? [],
    tools: message?.parts.filter((p) => p.type.startsWith('tool-')) ?? [],
    visibleText:
      message?.parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text)
        .join('') ?? '',
    guard: observed?.rawAnswer
      ? evaluateGrounding(observed.rawAnswer, chunks)
      : null,
    wire,
  };
  record.checks = checkScenario(scenario, record);
  record.passed = record.checks.every((c) => c.passed);
  records.push(record);
  await writeFile(recordsPath, JSON.stringify(records, null, 2));
  console.log(
    JSON.stringify({
      model: env.MODEL_ID,
      attempt,
      id: scenario.id,
      passed: record.passed,
      providerCalls: record.providerCalls,
      latencyMs: record.latencyMs,
      providerLatencyMs: record.providerLatencyMs,
      failures: record.checks.filter((c) => !c.passed).map((c) => c.name),
    }),
  );
  if (ledger.stopped429) break;
}
console.log(
  JSON.stringify({
    attempt,
    model: env.MODEL_ID,
    completed: records.length,
    selected: selected.length,
    passed: records.filter((r) => r.passed).length,
    campaignCalls: ledger.calls,
    stopped429: ledger.stopped429,
  }),
);
if (
  records.some((r) => !r.passed) ||
  records.length < selected.length + (resume ? previous.length : 0)
)
  process.exitCode = 1;
