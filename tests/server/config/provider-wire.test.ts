import { afterEach, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { runPipeline } from '../../../src/server/chat';
import { POST } from '../../../src/app/api/chat/route';
afterEach(() => vi.unstubAllGlobals());
it.each(['google', 'groq', 'openrouter'] as const)(
  'MOCK HTTP %s 429 never falls back to another configured key',
  async (provider) => {
    vi.stubEnv('MODEL_MODE', 'live');
    vi.stubEnv('MODEL_PROVIDER', provider);
    vi.stubEnv('MODEL_ID', '');
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'MOCK-google');
    vi.stubEnv('GROQ_API_KEY', 'MOCK-groq');
    vi.stubEnv('OPENROUTER_API_KEY', 'MOCK-openrouter');
    let requests = 0;
    vi.stubGlobal('fetch', async () => {
      requests++;
      return Response.json(
        {
          error: {
            message: 'SECRET quota_identifier upstream internals',
            code: 429,
          },
        },
        { status: 429 },
      );
    });
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            {
              id: 'x',
              role: 'user',
              parts: [{ type: 'text', text: 'pricing' }],
            },
          ],
        }),
      }),
    );
    expect(response.status).toBe(429);
    const text = await response.text();
    expect(JSON.parse(text)).toMatchObject({
      mode: 'live',
      provider,
      error: { code: 'RATE_LIMIT' },
    });
    expect(text).not.toMatch(/SECRET|quota_identifier|upstream|stack/);
    expect(requests).toBe(1);
  },
);
it.each(['google', 'groq', 'openrouter'] as const)(
  'MOCK HTTP %s serializes selected model and controls without fallback',
  async (provider) => {
    vi.stubEnv('MODEL_MODE', 'live');
    vi.stubEnv('MODEL_PROVIDER', provider);
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'MOCK-google');
    vi.stubEnv('GROQ_API_KEY', 'MOCK-groq');
    vi.stubEnv('OPENROUTER_API_KEY', 'MOCK-openrouter');
    const modelId = {
      google: 'gemini-2.5-flash',
      groq: 'qwen/qwen3.8-27b',
      openrouter: 'nvidia/nemotron-3.5-lightning:free',
    }[provider];
    vi.stubEnv('MODEL_ID', modelId);
    const requests: { url: string; body: Record<string, unknown> }[] = [];
    vi.stubGlobal(
      'fetch',
      async (input: RequestInfo | URL, init?: RequestInit) => {
        requests.push({
          url: String(input),
          body: z
            .record(z.string(), z.unknown())
            .parse(JSON.parse(String(init?.body))),
        });
        const body =
          provider === 'google'
            ? {
                candidates: [
                  {
                    content: {
                      role: 'model',
                      parts: [{ text: 'I do not have that information.' }],
                    },
                    finishReason: 'STOP',
                  },
                ],
                usageMetadata: {
                  promptTokenCount: 1,
                  candidatesTokenCount: 1,
                  totalTokenCount: 2,
                },
              }
            : {
                id: 'MOCK',
                object: 'chat.completion',
                created: 0,
                model: modelId,
                choices: [
                  {
                    index: 0,
                    message: {
                      role: 'assistant',
                      content: 'I do not have that information.',
                    },
                    finish_reason: 'stop',
                  },
                ],
                usage: {
                  prompt_tokens: 1,
                  completion_tokens: 1,
                  total_tokens: 2,
                },
              };
        return Response.json(body);
      },
    );
    const trace = await runPipeline({
      messages: [
        {
          id: 'm',
          role: 'user',
          parts: [{ type: 'text', text: 'quantum unicorn' }],
        },
      ],
    });
    expect(trace).toMatchObject({ provider, modelId, mode: 'live' });
    expect(requests).toHaveLength(1);
    const request = requests[0]!;
    if (provider === 'google') {
      expect(request.url).toContain(modelId);
      expect(request.body.generationConfig).toMatchObject({
        thinkingConfig: { thinkingBudget: 0, includeThoughts: false },
      });
    } else expect(request.body.model).toBe(modelId);
    if (provider === 'groq') expect(request.body.reasoning_effort).toBe('low');
    if (provider === 'openrouter') {
      expect(request.body.provider).toMatchObject({
        allow_fallbacks: false,
        require_parameters: true,
      });
      expect(request.body.reasoning).toMatchObject({
        effort: 'low',
        enabled: true,
      });
    }
  },
);
