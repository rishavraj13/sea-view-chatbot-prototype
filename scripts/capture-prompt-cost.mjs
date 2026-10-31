/** OFFLINE MOCK wire measurements: this script replaces fetch completely and never loads .env.local. */
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createUIMessageStream, readUIMessageStream } from 'ai';
import { z } from 'zod';
import { scenarios } from './live-scenarios.mjs';
const baseline = '505b90a';
const snapshot = resolve('.next/required-media-before');
const files = execFileSync(
  'git',
  ['ls-tree', '-r', '--name-only', baseline, '--', 'src/server', 'data'],
  { encoding: 'utf8' },
)
  .trim()
  .split('\n');
for (const file of files) {
  const target = join(snapshot, file);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, execFileSync('git', ['show', `${baseline}:${file}`]));
}
process.env.MODEL_MODE = 'live';
process.env.MODEL_PROVIDER = 'groq';
process.env.MODEL_ID = 'qwen/qwen3.8-27b';
process.env.REASONING_EFFORT = 'none';
process.env.GROQ_API_KEY = 'MOCK-offline-only';
let pendingTools = [];
let bodies = [];
globalThis.fetch = async (_input, init) => {
  const body = z
    .object({
      messages: z.array(z.unknown()),
      tools: z.array(z.unknown()).optional(),
      tool_choice: z.unknown().optional(),
    })
    .parse(JSON.parse(String(init.body)));
  bodies.push(body);
  return Response.json({
    id: 'MOCK',
    object: 'chat.completion',
    created: 0,
    model: 'MOCK',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: '',
          ...(pendingTools.length
            ? {
                tool_calls: pendingTools.map((name, i) => ({
                  id: `MOCK-${i}`,
                  type: 'function',
                  function: { name, arguments: '{}' },
                })),
              }
            : {}),
        },
        finish_reason: pendingTools.length ? 'tool_calls' : 'stop',
      },
    ],
    usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
  });
};
const before = await import(
  pathToFileURL(join(snapshot, 'src/server/chat/index.ts')).href
);
const after = await import('../src/server/chat/index.ts');
const captures = z
  .array(
    z.looseObject({
      id: z.string(),
      request: after.chatRequestSchema,
      message: z.unknown(),
    }),
  )
  .parse(
    JSON.parse(
      await readFile(
        'docs/examples/history-revision/qwen-qwen3-8-27b-initial.json',
        'utf8',
      ),
    ),
  );
const histories = new Map(
  captures
    .filter((r) => ['vip', 'rain', 'media-history'].includes(r.id))
    .map((r) => [r.id, [...r.request.messages, r.message]]),
);
let deluxe;
const stream = createUIMessageStream({
  execute({ writer }) {
    writer.write({ type: 'text-start', id: 'MOCK-text' });
    writer.write({
      type: 'text-delta',
      id: 'MOCK-text',
      delta: 'DELUXE costs ฿12,500 per person.',
    });
    writer.write({ type: 'text-end', id: 'MOCK-text' });
  },
});
for await (const message of readUIMessageStream({ stream })) deluxe = message;
histories.set('deluxe', [
  {
    id: 'MOCK-deluxe-user',
    role: 'user',
    parts: [{ type: 'text', text: 'How much is DELUXE?' }],
  },
  deluxe,
]);
const rows = [];
for (const scenario of scenarios) {
  const request = after.chatRequestSchema.parse({
    messages: [
      ...(histories.get(scenario.historyFrom) ?? []),
      {
        id: `MOCK-${scenario.id}`,
        role: 'user',
        parts: [{ type: 'text', text: scenario.question }],
      },
    ],
  });
  const row = { id: scenario.id, question: scenario.question };
  for (const [name, module] of [
    ['before', before],
    ['after', after],
  ]) {
    pendingTools = scenario.tools ?? [];
    bodies = [];
    await module.runPipeline(request);
    if (bodies.length !== 1) throw Error('Expected one MOCK provider exchange');
    const characters = JSON.stringify(bodies[0]).length;
    row[name] = { characters, approximateTokens: characters / 4 };
  }
  rows.push(row);
}
const averages = Object.fromEntries(
  ['before', 'after'].map((name) => [
    name,
    rows.reduce((sum, row) => sum + row[name].approximateTokens, 0) /
      rows.length,
  ]),
);
const report = {
  evidence: 'OFFLINE MOCK HTTP; zero live provider calls; no .env.local loaded',
  baseline,
  metric:
    'JSON.stringify({messages,tools,tool_choice}).length / 4; includes tool schemas and JSON overhead, not a tokenizer',
  history:
    'Identical before/after: recorded SDK VIP, rain and successful media-history messages; DELUXE is explicitly MOCK text produced through readUIMessageStream. This is prompt-size evidence, not model-quality evidence.',
  averages,
  rows,
};
await mkdir('docs/examples/required-media', { recursive: true });
await writeFile(
  'docs/examples/required-media/prompt-cost.json',
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    {
      evidence: report.evidence,
      scenarios: rows.length,
      mockedExchanges: rows.length * 2,
      averageApproximateTokens: averages,
    },
    null,
    2,
  ),
);
