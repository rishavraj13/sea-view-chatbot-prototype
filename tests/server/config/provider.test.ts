import { expect, it, vi } from 'vitest';
import { readEnv, modelMetadataSchema } from '../../../src/server/config';
import { runPipeline } from '../../../src/server/chat';
it.each(['google', 'groq', 'openrouter'])(
  'selected %s missing key returns explicit mock with public selection',
  async (provider) => {
    vi.stubEnv('MODEL_PROVIDER', provider);
    vi.stubEnv('MODEL_MODE', 'live');
    const trace = await runPipeline({
      messages: [
        { id: 'x', role: 'user', parts: [{ type: 'text', text: 'pricing' }] },
      ],
    });
    expect(trace.mode).toBe('mock');
    expect(trace.provider).toBe(provider);
    expect(trace.text).toContain('[MOCK]');
    expect(modelMetadataSchema.safeParse(trace).success).toBe(true);
  },
);
it('rejects invalid provider and reasoning settings', () => {
  vi.stubEnv('MODEL_PROVIDER', 'other');
  expect(() => readEnv()).toThrow();
  vi.stubEnv('MODEL_PROVIDER', 'google');
  vi.stubEnv('GOOGLE_THINKING_BUDGET', '-1');
  expect(() => readEnv()).toThrow();
});
