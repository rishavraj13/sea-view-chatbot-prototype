import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { APICallError } from 'ai';
import { expect, it, vi } from 'vitest';
import { POST } from '../../src/app/api/chat/route';
import { runPipeline } from '../../src/server/chat';
import { errorEnvelopeSchema } from '@/components/chat/api-error';

vi.mock('../../src/server/chat', async (original) => ({
  ...(await original<typeof import('../../src/server/chat')>()),
  runPipeline: vi.fn(),
}));

it('captures actual typed route errors with an OFFLINE MOCK pipeline (zero network)', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const api = (statusCode: number, retry?: string) =>
    new APICallError({
      message: 'OFFLINE MOCK provider error',
      url: 'https://offline.invalid',
      requestBodyValues: {},
      statusCode,
      ...(retry ? { responseHeaders: { 'retry-after': retry } } : {}),
    });
  const cases = [
    { name: 'rate-present', error: api(429, '12'), status: 429 },
    { name: 'rate-absent', error: api(429), status: 429 },
    {
      name: 'timeout',
      error: new DOMException('OFFLINE MOCK timeout', 'TimeoutError'),
      status: 504,
    },
    { name: 'model-failure', error: api(502), status: 502 },
    { name: 'invalid-input', error: undefined, status: 400 },
  ];
  const captures = [];
  try {
    for (const scenario of cases) {
      if (scenario.error)
        vi.mocked(runPipeline).mockRejectedValueOnce(scenario.error);
      const response = await POST(
        new Request('http://localhost/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            messages: scenario.error
              ? [
                  {
                    id: 'u',
                    role: 'user',
                    parts: [{ type: 'text', text: 'Test question' }],
                  },
                ]
              : [],
          }),
        }),
      );
      expect(response.status).toBe(scenario.status);
      const body = errorEnvelopeSchema.parse(await response.json());
      captures.push({ name: scenario.name, status: response.status, body });
    }
    const dir = resolve('node_modules', '.cache', 'chat-runtime');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      resolve(dir, 'errors.json'),
      JSON.stringify(
        {
          evidence:
            'OFFLINE MOCK pipeline exceptions through the actual POST route; zero network/provider calls',
          captures,
        },
        null,
        2,
      ) + '\n',
    );
  } finally {
    log.mockRestore();
  }
});
