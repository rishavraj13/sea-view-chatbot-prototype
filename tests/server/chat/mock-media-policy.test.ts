import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { DefaultChatTransport, readUIMessageStream, type UIMessage } from 'ai';
import { z } from 'zod';
import rows from '../../fixtures/media-policy.json';
import { getMediaPolicy, runPipeline } from '../../../src/server/chat';
import { mediaResultSchema } from '../../../src/server/media';
import { POST as chat } from '../../../src/app/api/chat/route';
import { POST as trace } from '../../../src/app/api/knowledge/trace/route';

const cases = z
  .array(
    z.object({
      text: z.string(),
      state: z.enum(['none', 'optional', 'required']),
      tools: z.array(z.enum(['sendBrochure', 'showVideo'])),
    }),
  )
  .parse(rows);
const traceResult = z.object({
  mode: z.literal('mock'),
  text: z.string(),
  toolCalls: z.array(
    z.object({
      name: z.enum(['sendBrochure', 'showVideo']),
      input: z.object({ id: z.string() }),
      result: mediaResultSchema,
    }),
  ),
  media: z.array(mediaResultSchema),
});
const request = (text: string) => ({
  messages: [
    {
      id: 'MOCK-policy-user',
      role: 'user' as const,
      parts: [{ type: 'text' as const, text }],
    },
  ],
});

beforeEach(() => {
  vi.stubEnv('MODEL_MODE', 'mock');
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(
    new Error('OFFLINE MOCK: network forbidden'),
  );
});
afterEach(() => {
  expect(globalThis.fetch).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

async function compareRoutes(question: string) {
  const pipeline = await runPipeline(request(question));
  const response = await trace(
    new Request('http://localhost/api/knowledge/trace', {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
  );
  expect(response.status).toBe(200);
  const inspected = traceResult.parse(await response.json());
  expect(inspected.toolCalls).toEqual(pipeline.toolCalls);
  expect(inspected.media).toEqual(pipeline.media);
  expect(inspected.text).toBe(pipeline.text);
  const transport = new DefaultChatTransport({
    api: 'http://localhost/api/chat',
    fetch: async (_url, init) =>
      chat(new Request('http://localhost/api/chat', init)),
  });
  const stream = await transport.sendMessages({
    chatId: 'MOCK-policy',
    trigger: 'submit-message',
    messages: request(question).messages,
    abortSignal: undefined,
    messageId: undefined,
  });
  let message: UIMessage | undefined;
  for await (const current of readUIMessageStream({ stream }))
    message = current;
  expect(message?.metadata).toMatchObject({ mode: 'mock' });
  const tools = message!.parts.filter(
    (part) =>
      part.type === 'tool-sendBrochure' || part.type === 'tool-showVideo',
  );
  expect(tools).toEqual(
    pipeline.toolCalls.map((call, index) => ({
      type: `tool-${call.name}`,
      toolCallId: `tool-${index}`,
      state: 'output-available',
      input: call.input,
      output: call.result,
    })),
  );
  expect(
    message!.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join(''),
  ).toBe(pipeline.text);
  return pipeline;
}

it.each(cases)(
  'explicit MOCK pipeline + chat/trace policy: $text -> $state',
  async (row) => {
    expect(getMediaPolicy(row.text)).toEqual({
      state: row.state,
      tools: row.tools,
    });
    const result = await compareRoutes(row.text);
    expect(result.mode).toBe('mock');
    expect(result.text).toContain('[MOCK]');
    expect(result.toolCalls.map((call) => call.name)).toEqual(
      row.state === 'none' ? [] : row.tools,
    );
    expect(result.media).toHaveLength(row.tools.length);
  },
);

it.each([
  ['Send brochure id brochure', 'brochure', 'brochure'],
  ['Send asset id video', 'video', 'video'],
  ['Send PDF id retired', 'retired', 'unavailable'],
  ['Send PDF id unknown-asset', 'unknown-asset', 'unavailable'],
  ['Send PDF id video', 'video', 'unavailable'],
  ['id retired', 'retired', 'unavailable'],
])(
  'explicit MOCK registry request remains unchanged: %s',
  async (question, id, kind) => {
    const result = await compareRoutes(question);
    expect(result.media).toHaveLength(1);
    expect(result.media[0]).toMatchObject({ id, kind });
    expect(result.toolCalls[0]?.input).toEqual({ id });
  },
);
