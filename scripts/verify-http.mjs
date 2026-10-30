import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { DefaultChatTransport, readUIMessageStream } from 'ai';
import { z } from 'zod';

const [base, label, expected, delay = '0'] = z
  .tuple([
    z.url(),
    z.string().regex(/^[a-z-]+$/),
    z.enum(['mock', 'live', 'error']),
    z.enum(['0', '35000']).optional(),
  ])
  .parse(process.argv.slice(2));
const records = [];
const failures = [];
const pause = () =>
  new Promise((resolve) => setTimeout(resolve, Number(delay)));
const mediaBase = {
  id: z.string(),
  title: z.string(),
  url: z.string(),
  isDemo: z.boolean(),
};
const mediaSchema = z.discriminatedUnion('kind', [
  z.object({
    ...mediaBase,
    kind: z.literal('brochure'),
    type: z.literal('pdf'),
  }),
  z.object({
    ...mediaBase,
    kind: z.literal('video'),
    type: z.literal('video'),
  }),
  z.object({
    ...mediaBase,
    kind: z.literal('unavailable'),
    reason: z.enum(['unknown', 'unavailable', 'wrong-type']),
  }),
]);
await mkdir('docs/examples/verification', { recursive: true });
const transport = new DefaultChatTransport({
  api: `${base}/api/chat`,
  fetch: async (url, init) => {
    const response = await fetch(url, init);
    records.push({
      endpoint: 'chat',
      status: response.status,
      mode: response.headers.get('x-model-mode'),
      wire: await response.clone().text(),
    });
    await writeFile(
      `docs/examples/verification/${label}.json`,
      JSON.stringify(records, null, 2),
    );
    return response;
  },
});
const user = (text, id) => ({
  id,
  role: 'user',
  parts: [{ type: 'text', text }],
});
const cases = [
  ['info', 'What is the demo tandem price?'],
  ['brochure', 'Send the brochure.'],
  ['video', 'Show the video.'],
  ['both', 'Send the brochure and show the video.'],
  ['follow-up', 'What does that include?'],
  ['unknown', 'What is the quantum unicorn policy?'],
  [
    'unavailable',
    'Send the PDF brochure with id retired, which is marked unavailable.',
  ],
];
let previous = [];
for (const [name, question] of cases) {
  if (delay !== '0') await pause();
  const messages =
    name === 'follow-up'
      ? [...previous, user(question, name)]
      : [user(question, name)];
  let assistant;
  try {
    const stream = await transport.sendMessages({
      trigger: 'submit-message',
      chatId: 'verification',
      messageId: undefined,
      messages,
    });
    for await (const message of readUIMessageStream({
      stream,
      terminateOnError: true,
    }))
      assistant = message;
    records.at(-1).case = name;
    records.at(-1).request = { messages };
    records.at(-1).parsed = assistant;
    assert.notEqual(expected, 'error', 'Expected a typed error');
    assert.equal(assistant?.metadata?.mode, expected);
    assert(assistant.parts.some((p) => p.type === 'text' && p.text.length > 0));
    const results = assistant.parts
      .filter(
        (p) => p.type.startsWith('tool-') && p.state === 'output-available',
      )
      .map((p) => mediaSchema.parse(p.output));
    if (name === 'brochure') assert(results.some((r) => r.kind === 'brochure'));
    if (name === 'video') assert(results.some((r) => r.kind === 'video'));
    if (name === 'unavailable')
      assert(
        results.some((r) => r.kind === 'unavailable' && r.id === 'retired'),
        'Requested retired asset must be unavailable',
      );
    if (name === 'unknown')
      assert(
        assistant.parts.some(
          (p) =>
            p.type === 'text' &&
            p.text.includes('I do not have that information.'),
        ),
      );
    if (name === 'both') {
      for (const tool of ['tool-sendBrochure', 'tool-showVideo'])
        assert(
          assistant.parts.some(
            (p) =>
              p.type === tool &&
              p.state === 'output-available' &&
              p.output.isDemo === true,
          ),
          `Missing ${tool}`,
        );
    }
    if (name === 'info') previous = [...messages, assistant];
    records.at(-1).parsed = assistant;
  } catch (error) {
    if (expected !== 'error') {
      failures.push({
        case: name,
        message:
          error instanceof assert.AssertionError
            ? error.message
            : 'HTTP or SDK consumer failed; see sanitized endpoint capture.',
      });
    } else {
      const failure = z
        .object({
          mode: z.literal('live'),
          error: z.object({
            code: z.literal('MODEL_FAILURE'),
            message: z.string(),
          }),
        })
        .parse(JSON.parse(records.at(-1).wire));
      assert.equal(records.at(-1).status, 502);
      records.at(-1).parsed = failure;
    }
  }
  if (delay !== '0') await pause();
  const response = await fetch(`${base}/api/knowledge/trace`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  const body = await response.json();
  records.push({
    case: name,
    question,
    endpoint: 'trace',
    status: response.status,
    body,
    limitation:
      name === 'follow-up'
        ? 'Trace accepts question only; cannot replay client history.'
        : undefined,
  });
  console.log(
    `${label} ${name}: chat=${records.at(-2).status} trace=${response.status} mode=${body.mode} tools=${body.toolCalls?.map((t) => t.name).join(',') ?? 'none'}`,
  );
  await writeFile(
    `docs/examples/verification/${label}.json`,
    JSON.stringify({ records, failures }, null, 2),
  );
}
await mkdir('docs/examples/verification', { recursive: true });
await writeFile(
  `docs/examples/verification/${label}.json`,
  JSON.stringify({ records, failures }, null, 2),
);
console.log(
  'SDK DefaultChatTransport + readUIMessageStream verification completed.',
);
assert.equal(failures.length, 0, JSON.stringify(failures));
