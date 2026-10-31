import { beforeEach, expect, it, vi } from 'vitest';
import { MockLanguageModelV4 } from 'ai/test';
import { z } from 'zod';
import rows from '../../fixtures/media-policy.json';
const state = vi.hoisted(() => ({ model: null as MockLanguageModelV4 | null }));
vi.mock('@ai-sdk/groq', () => ({ createGroq: () => () => state.model }));
import { getMediaPolicy, runPipeline } from '../../../src/server/chat';
const cases = z
  .array(
    z.object({
      text: z.string(),
      state: z.enum(['none', 'optional', 'required']),
      tools: z.array(z.enum(['sendBrochure', 'showVideo'])),
    }),
  )
  .parse(rows);
const usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 1, text: 1, reasoning: 0 },
};
beforeEach(() => {
  vi.stubEnv('MODEL_MODE', 'live');
  vi.stubEnv('MODEL_PROVIDER', 'groq');
  vi.stubEnv('MODEL_ID', 'qwen/qwen3.8-27b');
  vi.stubEnv('GROQ_API_KEY', 'MOCK-offline-only');
  vi.stubEnv('REASONING_EFFORT', 'none');
});
it.each(cases)('MOCK provider policy $text -> $state', async (row) => {
  expect(getMediaPolicy(row.text)).toEqual({
    state: row.state,
    tools: row.tools,
  });
  state.model = new MockLanguageModelV4({
    doGenerate: {
      content:
        row.state === 'required'
          ? row.tools.map((toolName, i) => ({
              type: 'tool-call' as const,
              toolName,
              toolCallId: `MOCK-${i}`,
              input: '{}',
            }))
          : [{ type: 'text', text: 'I do not have that information.' }],
      finishReason: {
        unified: row.state === 'required' ? 'tool-calls' : 'stop',
        raw: 'stop',
      },
      usage,
      warnings: [],
    },
  });
  const result = await runPipeline({
    messages: [
      { id: 'u', role: 'user', parts: [{ type: 'text', text: row.text }] },
    ],
  });
  const options = state.model.doGenerateCalls[0]!;
  expect(options.toolChoice).toEqual({
    type:
      row.state === 'none'
        ? 'none'
        : row.state === 'required'
          ? 'required'
          : 'auto',
  });
  expect((options.tools ?? []).map((tool) => tool.name)).toEqual(row.tools);
  expect(state.model.doGenerateCalls).toHaveLength(1);
  expect(state.model.doStreamCalls).toHaveLength(0);
  expect(result.toolCalls.map((call) => call.name)).toEqual(
    row.state === 'required' ? row.tools : [],
  );
});
it('a required tool-only step can omit factual prose without a continuation call', async () => {
  state.model = new MockLanguageModelV4({
    doGenerate: {
      content: [
        {
          type: 'tool-call',
          toolCallId: 'MOCK-pdf',
          toolName: 'sendBrochure',
          input: '{}',
        },
      ],
      finishReason: { unified: 'tool-calls', raw: 'tool_calls' },
      usage,
      warnings: [],
    },
  });
  const result = await runPipeline({
    messages: [
      {
        id: 'u',
        role: 'user',
        parts: [
          {
            type: 'text',
            text: 'How much is the VIP package and can you send me the brochure?',
          },
        ],
      },
    ],
  });
  expect(result.text).toBe('Here is the brochure (demo material).');
  expect(result.citations).toEqual([]);
  expect(state.model.doGenerateCalls).toHaveLength(1);
});
