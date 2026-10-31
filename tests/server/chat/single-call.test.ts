import { beforeEach, expect, it, vi } from 'vitest';
import { MockLanguageModelV4 } from 'ai/test';
import { retrieve } from '../../../src/server/knowledge';
import { APICallError } from 'ai';
import { POST } from '../../../src/app/api/chat/route';
const diagnostic = {
  question: 'How much is the VIP package?',
  modelText:
    'The VIP package is ฿14,000 per person. [https://www.greedyadventures.com/experiences/sea-view-skydiving#options]',
};
const state = vi.hoisted(() => ({ model: null as MockLanguageModelV4 | null }));
vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: () => () => state.model,
}));
import { runPipeline, summarizeMedia } from '../../../src/server/chat';
const user = (text: string, id = 'u') => ({
  id,
  role: 'user' as const,
  parts: [{ type: 'text' as const, text }],
});
const usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 1, text: 1, reasoning: 0 },
};
beforeEach(() => {
  vi.stubEnv('MODEL_MODE', 'live');
  vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'MOCK-key-never-network');
});
it('MOCK replay of the real-fact trailing-citation fixture returns the covered price in one call', async () => {
  const model = new MockLanguageModelV4({
    doGenerate: {
      content: [{ type: 'text', text: diagnostic.modelText }],
      finishReason: { unified: 'stop', raw: 'stop' },
      usage,
      warnings: [],
    },
  });
  state.model = model;
  const trace = await runPipeline({ messages: [user(diagnostic.question)] });
  expect(trace.text).toContain('฿14,000');
  expect(trace.text).not.toContain('https://');
  expect(trace.citations[0]?.url).toBe(
    'https://www.greedyadventures.com/experiences/sea-view-skydiving#options',
  );
  expect(trace.text).not.toContain('I do not have');
  expect(model.doGenerateCalls).toHaveLength(1);
});
it.each([
  ['info', 'What is the tandem price?', []],
  ['brochure', 'Send brochure', ['sendBrochure']],
  ['video', 'Show video', ['showVideo']],
  ['both', 'Send brochure and video', ['sendBrochure', 'showVideo']],
  ['unavailable', 'Send PDF brochure id retired', ['sendBrochure']],
  ['unknown', 'quantum unicorn', []],
  ['follow-up', 'What does that include?', []],
] as const)(
  'MOCK language provider %s uses exactly one SDK provider call',
  async (name, question, tools) => {
    const content = tools.length
      ? tools.map((toolName, i) => ({
          type: 'tool-call' as const,
          toolCallId: `call-${i}`,
          toolName,
          input: JSON.stringify({
            id:
              name === 'unavailable'
                ? 'retired'
                : toolName === 'sendBrochure'
                  ? 'brochure'
                  : 'video',
          }),
        }))
      : [{ type: 'text' as const, text: 'I do not have that information.' }];
    const model = new MockLanguageModelV4({
      doGenerate: {
        content,
        finishReason: {
          unified: tools.length ? 'tool-calls' : 'stop',
          raw: 'stop',
        },
        usage,
        warnings: [],
      },
    });
    state.model = model;
    const trace = await runPipeline({
      messages:
        name === 'follow-up'
          ? [user('What is the tandem package price?', 'prior'), user(question)]
          : [user(question)],
    });
    expect(model.doGenerateCalls).toHaveLength(1);
    expect(model.doStreamCalls).toHaveLength(0);
    expect(trace.toolCalls.map((c) => c.name)).toEqual(tools);
    expect(trace.text.length).toBeGreaterThan(0);
    expect(model.doGenerateCalls[0]?.providerOptions?.google).toEqual({
      thinkingConfig: { thinkingBudget: 0, includeThoughts: false },
    });
    if (name === 'unavailable')
      expect(trace.media[0]?.kind).toBe('unavailable');
  },
);
it.each([
  [
    'If weather holds your jump, you can move to another date at no cost or receive a full refund.',
    true,
  ],
  ['If it rains, you receive a refund within 99999 working days.', false],
])(
  'MOCK provider replay checks paraphrased weather prose before separating its citation: %s',
  async (answer, accepted) => {
    state.model = new MockLanguageModelV4({
      doGenerate: {
        content: [
          {
            type: 'text',
            text: `${answer} (https://www.greedyadventures.com/cancellations#page-content)`,
          },
        ],
        finishReason: { unified: 'stop', raw: 'stop' },
        usage,
        warnings: [],
      },
    });
    const trace = await runPipeline({ messages: [user('What if it rains?')] });
    expect(state.model.doGenerateCalls).toHaveLength(1);
    expect(trace.text).toBe(
      accepted ? answer : 'I do not have that information.',
    );
    expect(trace.citations).toHaveLength(accepted ? 1 : 0);
  },
);
it('keeps grounded text emitted with tools and never calls for a continuation', async () => {
  const chunk = retrieve('VIP price')[0]!;
  const text = `[${chunk.source.url}] ${chunk.text}`;
  const model = new MockLanguageModelV4({
    doGenerate: {
      content: [
        { type: 'text', text },
        {
          type: 'tool-call',
          toolCallId: 'pdf',
          toolName: 'sendBrochure',
          input: '{"id":"brochure"}',
        },
      ],
      finishReason: { unified: 'tool-calls', raw: 'tool_calls' },
      usage,
      warnings: [],
    },
  });
  state.model = model;
  const trace = await runPipeline({
    messages: [user('VIP price and brochure')],
  });
  expect(trace.text).toContain(retrieve('VIP price')[0]!.text);
  expect(trace.citations[0]?.url).toBe(retrieve('VIP price')[0]!.source.url);
  expect(trace.text).toContain('/demo/brochure.pdf');
  expect(model.doGenerateCalls).toHaveLength(1);
});
it('pure media summary describes registry output without invented facts', () => {
  expect(
    summarizeMedia([
      {
        kind: 'unavailable',
        id: 'retired',
        title: 'DEMO retired',
        url: '',
        isDemo: true,
        reason: 'unavailable',
      },
    ]),
  ).toBe('DEMO retired: unavailable.');
  expect(summarizeMedia([])).toBe('');
});
it.each([
  [
    'RATE_LIMIT',
    429,
    new APICallError({
      message: 'SECRET quotaId private',
      url: 'https://private.invalid',
      requestBodyValues: { apiKey: 'SECRET' },
      statusCode: 429,
      responseBody: 'quotaId SECRET',
    }),
  ],
  [
    'TIMEOUT',
    504,
    new DOMException('SECRET provider internals', 'TimeoutError'),
  ],
  [
    'MODEL_FAILURE',
    502,
    new APICallError({
      message: 'SECRET provider internals',
      url: 'https://private.invalid',
      requestBodyValues: { apiKey: 'SECRET' },
      statusCode: 500,
    }),
  ],
] as const)(
  'MOCK provider %s is a sanitized typed HTTP error without fallback or retry',
  async (code, status, error) => {
    const model = new MockLanguageModelV4({
      doGenerate: async () => {
        throw error;
      },
    });
    state.model = model;
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [user('pricing')] }),
      }),
    );
    expect(response.status).toBe(status);
    const text = await response.text();
    expect(JSON.parse(text)).toMatchObject({ mode: 'live', error: { code } });
    expect(text).not.toMatch(/SECRET|quotaId|private|stack/);
    expect(model.doGenerateCalls).toHaveLength(1);
  },
);
