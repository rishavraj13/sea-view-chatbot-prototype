import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { DefaultChatTransport, readUIMessageStream } from 'ai';
import type { UIMessage } from 'ai';
import { z } from 'zod';
import recorded from '../../../docs/examples/history-revision/qwen-qwen3-8-27b-initial.json';
import { POST } from '../../../src/app/api/chat/route';
import {
  buildModelMessages,
  chatRequestSchema,
} from '../../../src/server/chat';

const user = (text: string, id = 'u') => ({
  id,
  role: 'user' as const,
  parts: [{ type: 'text' as const, text }],
});
const bodies: { role: string; content: string }[][] = [];
let responses: unknown[] = [];
const response = (text: string, tools = false) => ({
  id: 'MOCK-id',
  object: 'chat.completion',
  created: 0,
  model: 'MOCK-Groq',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: text,
        ...(tools
          ? {
              tool_calls: ['sendBrochure', 'showVideo'].map((name, i) => ({
                id: `MOCK-${i}`,
                type: 'function',
                function: { name, arguments: '{}' },
              })),
            }
          : {}),
      },
      finish_reason: tools ? 'tool_calls' : 'stop',
    },
  ],
  usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
});
beforeEach(() => {
  bodies.length = 0;
  vi.stubEnv('MODEL_MODE', 'live');
  vi.stubEnv('MODEL_PROVIDER', 'groq');
  vi.stubEnv('MODEL_ID', 'qwen/qwen3.8-27b');
  vi.stubEnv('GROQ_API_KEY', 'MOCK-only-never-network');
  vi.stubGlobal(
    'fetch',
    async (_input: RequestInfo | URL, init?: RequestInit) => {
      bodies.push(
        z
          .object({
            messages: z.array(
              z.object({ role: z.string(), content: z.string() }),
            ),
          })
          .parse(JSON.parse(String(init?.body))).messages,
      );
      return Response.json(responses.shift());
    },
  );
});
afterEach(() => vi.unstubAllGlobals());
async function send(messages: UIMessage[]): Promise<UIMessage> {
  const transport = new DefaultChatTransport({
    api: 'http://localhost/api/chat',
    fetch: async (input, init) => POST(new Request(String(input), init)),
  });
  const stream = await transport.sendMessages({
    trigger: 'submit-message',
    chatId: 'MOCK-history',
    messages,
    messageId: undefined,
    abortSignal: undefined,
  });
  let last: UIMessage | undefined;
  for await (const message of readUIMessageStream({ stream })) last = message;
  expect(last).toBeDefined();
  return last!;
}
it('projects the exact recorded SDK media-result message to its visible assistant text only', () => {
  const capture = recorded.find((record) => record.id === 'media-history')!;
  const request = chatRequestSchema.parse({
    messages: [
      ...capture.request.messages,
      capture.message,
      user('How much is ECO?', 'follow'),
    ],
  });
  const assistant = request.messages.find(
    (message) => message.role === 'assistant',
  )!;
  expect(assistant.parts.some((part) => part.type === 'step-start')).toBe(true);
  expect(
    assistant.parts.some((part) => part.type === 'tool-sendBrochure'),
  ).toBe(true);
  const text = assistant.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n');
  expect(text).toBe('Here is the brochure (demo material).');
  const projected = buildModelMessages(request.messages);
  expect(projected.find((message) => message.role === 'assistant')).toEqual({
    role: 'assistant',
    content: text,
  });
  for (const message of projected)
    expect(message.content).not.toMatch(
      /\{|\btype\b|sourceId|step-start|source-url|tool-sendBrochure|tool-showVideo/,
    );
});
it.each(['source', 'media'] as const)(
  'MOCK HTTP replay of actual SDK %s history sends only visible user/assistant text',
  async (kind) => {
    const page =
      'https://www.greedyadventures.com/experiences/sea-view-skydiving#options';
    responses = [
      response(`VIP is ฿14,000 per person. [${page}]`, kind === 'media'),
      response(`ECO is ฿9,500 per person. [${page}]`),
    ];
    const initial = user(
      kind === 'media'
        ? 'How much is VIP? Send brochure and video.'
        : 'How much is VIP?',
    );
    const assistant = await send([initial]);
    expect(assistant.parts.some((p) => p.type === 'source-url')).toBe(true);
    if (kind === 'media')
      expect(
        assistant.parts.filter((p) => p.type.startsWith('tool-')),
      ).toHaveLength(2);
    const messages = [initial, assistant, user('How much is ECO?', 'follow')];
    const validated = chatRequestSchema.parse({ messages });
    await send(messages);
    const visible = assistant.parts
      .filter((p) => p.type === 'text')
      .map((p) => p.text)
      .join('\n');
    expect(bodies[1]!.find((m) => m.role === 'assistant')!.content).toBe(
      visible,
    );
    expect(bodies[1]!.filter((m) => m.role !== 'system')).toEqual(
      buildModelMessages(validated.messages),
    );
    for (const message of bodies[1]!) {
      expect(message.content).not.toMatch(
        /\{|\btype\b|sourceId|step-start|source-url|tool-sendBrochure|tool-showVideo/,
      );
    }
  },
);
