import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { DefaultChatTransport, readUIMessageStream } from 'ai';
import { z } from 'zod';
import { chatRequestSchema } from '../src/server/chat/index.ts';
import { citationSchema } from '../src/server/knowledge/index.ts';
import { mediaResultSchema } from '../src/server/media/index.ts';

const scenarios = [
  {
    id: 'brochure',
    question: 'Can you send me a brochure?',
    tools: ['sendBrochure'],
  },
  {
    id: 'video',
    question: 'Can I see a video of the experience?',
    tools: ['showVideo'],
  },
  {
    id: 'both',
    question: 'Send me the brochure and a video.',
    tools: ['sendBrochure', 'showVideo'],
  },
  { id: 'included', question: 'What is included in the package?', fact: true },
  { id: 'vip', question: 'How much is the VIP package?', fact: true },
  {
    id: 'follow-up',
    question: "and what's included?",
    historyFrom: 'vip',
    fact: true,
  },
  { id: 'rain', question: 'What if it rains?', fact: true },
  { id: 'age', question: 'What is the age limit?', refuse: true },
];
const metadataSchema = z.object({
  mode: z.literal('live'),
  provider: z.literal('groq'),
  modelId: z.literal('qwen/qwen3.8-27b'),
});

/** Checks public remote evidence without pretending the private provider response is observable. */
export function checkProductionScenario(scenario, record) {
  const checks = [];
  const check = (name, passed) =>
    checks.push({ name, passed: Boolean(passed) });
  check('HTTP 200', record.status === 200);
  check('one transport request; no retries', record.transportRequests === 1);
  check(
    'live Groq Qwen metadata',
    metadataSchema.safeParse(record.message?.metadata).success,
  );
  check('nonempty answer', Boolean(record.visibleText.trim()));
  check(
    'no raw URL or citation label',
    !/https?:\/\/|\/demo\/|\b(?:cite|citation|sources?|references?|ref|see)\s*:|\[\s*\]|\(\s*\)/i.test(
      record.visibleText,
    ),
  );
  check(
    'no serialized parts or retrieval language',
    !/\{|sourceId|step-start|source-url|tool-sendBrochure|tool-showVideo|\b(?:context|retrieved|sources?|sections?)\b/i.test(
      record.visibleText,
    ),
  );
  const expected = scenario.tools ?? [];
  check(
    'exact requested executed tools',
    JSON.stringify(
      record.tools.map((t) => t.type.replace('tool-', '')).sort(),
    ) === JSON.stringify([...expected].sort()),
  );
  check(
    'valid structured source shapes',
    record.citations.every((c) => citationSchema.safeParse(c).success),
  );
  check(
    'valid available media shapes',
    record.tools.every(
      (t) =>
        t.state === 'output-available' &&
        mediaResultSchema.safeParse(t.output).success &&
        t.output.kind !== 'unavailable',
    ),
  );
  const refused = /I do not have that information\./i.test(record.visibleText);
  check('no refusal beside media', !record.tools.length || !refused);
  if (scenario.fact) {
    check(
      'covered fact answered with structured sources',
      !refused && record.citations.length > 0,
    );
    check(
      'terminal factual punctuation',
      /[.!?]$/.test(record.visibleText.trim()),
    );
  }
  if (expected.length) {
    check(
      'one demo badge per demo result',
      (record.visibleText.match(/\(demo material\)/g) ?? []).length ===
        record.tools.filter((t) => t.output.isDemo).length,
    );
    check(
      'PDF and video kinds match tools',
      record.tools.every((t) =>
        t.type === 'tool-sendBrochure'
          ? t.output.kind === 'brochure'
          : t.output.kind === 'video',
      ),
    );
  }
  if (scenario.refuse)
    check(
      'unsupported question refused without sources',
      refused && record.citations.length === 0,
    );
  else check('no refusal on covered question or requested file', !refused);
  return checks;
}

/** Runs the authorized eight-request production campaign, spacing starts by at least ten seconds. */
export async function runProductionSmoke(args) {
  const [, base] = z
    .tuple([
      z.literal('--base-url'),
      z.url().refine((value) => {
        const u = new URL(value);
        return (
          u.protocol === 'https:' &&
          !u.username &&
          !u.password &&
          !u.search &&
          !u.hash &&
          u.pathname === '/'
        );
      }),
    ])
    .parse(args);
  const baseUrl = new URL(base).origin;
  const dir = join('docs', 'examples', 'production-smoke');
  await mkdir(dir, { recursive: true });
  const ledgerPath = join(dir, 'budget.json');
  try {
    await readFile(ledgerPath);
    throw Error(
      'Production campaign already exists; no duplicate runs or retries authorized',
    );
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  const ledger = {
    baseUrl,
    cap: 8,
    minimumSpacingMs: 10000,
    calls: 0,
    lastCallAt: 0,
    stopped429: false,
  };
  const save = () => writeFile(ledgerPath, JSON.stringify(ledger, null, 2));
  await save();
  const histories = new Map();
  const records = [];
  for (const scenario of scenarios) {
    if (ledger.calls >= 8 || ledger.stopped429) break;
    const request = chatRequestSchema.parse({
      messages: [
        ...(histories.get(scenario.historyFrom) ?? []),
        {
          id: `production-${scenario.id}`,
          role: 'user',
          parts: [{ type: 'text', text: scenario.question }],
        },
      ],
    });
    let status = 0,
      wire = '',
      message,
      transportRequests = 0,
      rateLimitHeaders = {},
      startedAt,
      latencyMs;
    const transport = new DefaultChatTransport({
      api: `${baseUrl}/api/chat`,
      fetch: async (input, init) => {
        if (
          String(input) !== `${baseUrl}/api/chat` ||
          transportRequests ||
          ledger.calls >= 8 ||
          ledger.stopped429
        )
          throw Error('Production transport/budget restriction');
        const pause = 10100 - (Date.now() - ledger.lastCallAt);
        if (pause > 0)
          await new Promise((resolve) => setTimeout(resolve, pause));
        transportRequests++;
        ledger.calls++;
        ledger.lastCallAt = Date.now();
        startedAt = new Date(ledger.lastCallAt).toISOString();
        await save();
        const started = performance.now();
        const response = await fetch(input, {
          ...init,
          credentials: 'omit',
          redirect: 'error',
          signal: AbortSignal.timeout(45000),
        });
        status = response.status;
        rateLimitHeaders = Object.fromEntries(
          [...response.headers].filter(
            ([name]) =>
              name === 'retry-after' || name.startsWith('x-ratelimit-'),
          ),
        );
        wire = await response.clone().text();
        latencyMs = Math.round(performance.now() - started);
        if (status === 429) {
          ledger.stopped429 = true;
          await save();
        }
        return response;
      },
    });
    try {
      const stream = await transport.sendMessages({
        trigger: 'submit-message',
        chatId: 'production-smoke',
        messages: request.messages,
        messageId: undefined,
        abortSignal: undefined,
      });
      for await (const part of readUIMessageStream({ stream })) message = part;
    } catch {
      // Persist only the public HTTP response; SDK exceptions can contain upstream details.
    }
    if (message) histories.set(scenario.id, [...request.messages, message]);
    const visibleText =
      message?.parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text)
        .join('') ?? '';
    const record = {
      id: scenario.id,
      question: scenario.question,
      evidence:
        'LIVE deployed endpoint through DefaultChatTransport + readUIMessageStream; no direct provider request',
      baseUrl,
      request,
      status,
      startedAt,
      latencyMs,
      transportRequests,
      providerCalls: {
        expected: transportRequests,
        measured: null,
        basis:
          'Committed pipeline has one generateText call, maxRetries=0, no continuation; upstream dispatch is not observable over the public API',
      },
      rawProviderAnswer: null,
      rawAnswerMeaning:
        'Exact unsanitized text received from deployed UIMessage stream, after the existing server guard; private pre-guard provider text is not exposed',
      rawAnswer: visibleText,
      visibleText,
      message,
      citations: message?.parts.filter((p) => p.type === 'source-url') ?? [],
      tools: message?.parts.filter((p) => p.type.startsWith('tool-')) ?? [],
      rateLimitHeaders,
      wire,
    };
    record.checks = checkProductionScenario(scenario, record);
    record.passed = record.checks.every((c) => c.passed);
    records.push(record);
    await writeFile(
      join(dir, 'results.json'),
      JSON.stringify(records, null, 2),
    );
    console.log(
      JSON.stringify({
        id: record.id,
        status,
        passed: record.passed,
        transportRequests,
        latencyMs,
        rateLimitHeaders,
        failures: record.checks.filter((c) => !c.passed).map((c) => c.name),
      }),
    );
    if (ledger.stopped429) break;
  }
  console.log(
    JSON.stringify({
      completed: records.length,
      planned: scenarios.length,
      passed: records.filter((r) => r.passed).length,
      requests: ledger.calls,
      stopped429: ledger.stopped429,
      reruns: 0,
    }),
  );
  if (records.length !== scenarios.length || records.some((r) => !r.passed))
    process.exitCode = 1;
}
