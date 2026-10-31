import { expect, it, vi } from 'vitest';
import type { MediaResult } from '../../../src/server/media';
vi.mock('ai', async (original) => ({
  ...(await original<typeof import('ai')>()),
  generateText: async (options: {
    tools: {
      sendBrochure: {
        execute: () => Promise<MediaResult>;
      };
    };
  }) => {
    await options.tools.sendBrochure.execute();
    return { text: '' };
  },
}));
import { runPipeline } from '../../../src/server/chat';
it('MOCK provider substitution cannot override an explicit unavailable asset ID', async () => {
  vi.stubEnv('MODEL_MODE', 'live');
  vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'mock-not-a-real-key');
  try {
    const trace = await runPipeline({
      messages: [
        {
          id: 'test',
          role: 'user',
          parts: [{ type: 'text', text: 'Send PDF brochure id retired' }],
        },
      ],
    });
    expect(trace.media).toHaveLength(1);
    expect(trace.media[0]).toMatchObject({
      kind: 'unavailable',
      id: 'retired',
    });
    expect(trace.text).toContain("isn't available");
  } finally {
    vi.stubEnv('MODEL_MODE', 'mock');
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', '');
  }
});
