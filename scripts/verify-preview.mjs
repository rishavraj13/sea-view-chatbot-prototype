import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DefaultChatTransport, readUIMessageStream } from 'ai';
import { z } from 'zod';

const dir = 'docs/examples/verification/';
const wire = await readFile(`${dir}preview-chat.sse`, 'utf8');
const sources = z
  .object({
    isDemo: z.literal(true),
    sources: z.array(
      z.object({
        title: z.string(),
        url: z.url(),
        capturedAt: z.iso.datetime(),
        text: z.string(),
      }),
    ),
    media: z.array(
      z.object({
        id: z.string(),
        type: z.enum(['pdf', 'video']),
        available: z.boolean(),
      }),
    ),
  })
  .parse(JSON.parse(await readFile(`${dir}preview-sources.json`, 'utf8')));
assert.equal(sources.sources.length, 5);
const trace = z
  .object({
    mode: z.literal('mock'),
    text: z.string(),
    media: z.array(
      z.object({
        kind: z.enum(['brochure', 'video']),
        id: z.string(),
        url: z.string(),
        isDemo: z.literal(true),
      }),
    ),
  })
  .parse(JSON.parse(await readFile(`${dir}preview-trace.json`, 'utf8')));
const transport = new DefaultChatTransport({
  api: 'https://preview.invalid/api/chat',
  fetch: async () =>
    new Response(wire, {
      headers: {
        'Content-Type': 'text/event-stream',
        'x-vercel-ai-ui-message-stream': 'v1',
      },
    }),
});
const stream = await transport.sendMessages({
  trigger: 'submit-message',
  chatId: 'preview-capture',
  messages: [],
  messageId: undefined,
});
let last;
for await (const message of readUIMessageStream({
  stream,
  terminateOnError: true,
}))
  last = message;
assert.equal(last.metadata.mode, 'mock');
assert.equal(
  last.parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text)
    .join(''),
  trace.text,
);
const media = last.parts
  .filter((p) => p.type.startsWith('tool-'))
  .map((p) => p.output);
assert.equal(media.length, 2);
for (const [i, item] of trace.media.entries())
  for (const field of ['kind', 'id', 'url', 'isDemo'])
    assert.deepEqual(media[i][field], item[field]);
assert.equal(
  (await readFile('.next/preview-brochure.pdf')).subarray(0, 5).toString(),
  '%PDF-',
);
console.log(
  'Preview captures verified: 5 bundled sources; mock mode explicit; SSE text and both media payloads intact and equal to trace; PDF signature valid.',
);
