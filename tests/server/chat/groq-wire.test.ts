import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { runPipeline } from '../../../src/server/chat';
const wireSchema = z.object({
  tool_choice: z.enum(['auto', 'required']).optional(),
  tools: z
    .array(
      z.object({
        function: z.object({
          name: z.string(),
          parameters: z.object({
            properties: z.record(z.string(), z.unknown()),
            additionalProperties: z.literal(false),
          }),
        }),
      }),
    )
    .optional(),
});
beforeEach(() => {
  vi.stubEnv('MODEL_MODE', 'live');
  vi.stubEnv('MODEL_PROVIDER', 'groq');
  vi.stubEnv('MODEL_ID', 'qwen/qwen3.8-27b');
  vi.stubEnv('GROQ_API_KEY', 'MOCK-offline-only');
  vi.stubEnv('REASONING_EFFORT', 'none');
});
afterEach(() => vi.unstubAllGlobals());
it.each([
  ['What is included in the package?', undefined, []],
  ['Does DELUXE include video?', 'auto', ['showVideo']],
  ['Send me the PDF', 'required', ['sendBrochure']],
  [
    'Send me the brochure and a video.',
    'required',
    ['sendBrochure', 'showVideo'],
  ],
] as const)(
  'OFFLINE actual Groq serializer: %s',
  async (question, choice, names) => {
    const bodies: z.infer<typeof wireSchema>[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: unknown, init: RequestInit) => {
        bodies.push(wireSchema.parse(JSON.parse(String(init.body))));
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
                ...(choice === 'required'
                  ? {
                      tool_calls: names.map((name, i) => ({
                        id: `MOCK-${i}`,
                        type: 'function',
                        function: { name, arguments: '{}' },
                      })),
                    }
                  : {}),
              },
              finish_reason: choice === 'required' ? 'tool_calls' : 'stop',
            },
          ],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        });
      }),
    );
    const result = await runPipeline({
      messages: [
        { id: 'u', role: 'user', parts: [{ type: 'text', text: question }] },
      ],
    });
    expect(bodies).toHaveLength(1);
    expect(bodies[0]!.tool_choice).toBe(choice);
    expect((bodies[0]!.tools ?? []).map((t) => t.function.name)).toEqual(names);
    for (const tool of bodies[0]!.tools ?? [])
      expect(tool.function.parameters.properties).toEqual({});
    expect(result.toolCalls.map((t) => t.name)).toEqual(
      choice === 'required' ? names : [],
    );
  },
);
it('OFFLINE required promise without a tool fails safely, without retry or continuation', async () => {
  const fetch = vi.fn(async () =>
    Response.json({
      id: 'MOCK',
      object: 'chat.completion',
      created: 0,
      model: 'MOCK',
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: "I'm sending the brochure." },
          finish_reason: 'stop',
        },
      ],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    }),
  );
  vi.stubGlobal('fetch', fetch);
  await expect(
    runPipeline({
      messages: [
        {
          id: 'u',
          role: 'user',
          parts: [{ type: 'text', text: 'Brochure please' }],
        },
      ],
    }),
  ).rejects.toMatchObject({
    code: 'MODEL_FAILURE',
    status: 502,
    message: 'The model is temporarily unavailable.',
  });
  expect(fetch).toHaveBeenCalledTimes(1);
});
