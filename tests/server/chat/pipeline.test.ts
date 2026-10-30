import { expect, it } from 'vitest';
import {
  chatRequestSchema,
  runPipeline,
  mapError,
} from '../../../src/server/chat';
const request = (text: string) => ({
  messages: [
    {
      id: '1',
      role: 'user' as const,
      parts: [{ type: 'text' as const, text }],
    },
  ],
});
it('an explicit PDF request for a video ID returns wrong-type unavailable', async () => {
  const trace = await runPipeline(request('Send PDF brochure id video'), {
    mock: true,
  });
  expect(trace.media).toHaveLength(1);
  expect(trace.media[0]).toMatchObject({
    kind: 'unavailable',
    id: 'video',
    reason: 'wrong-type',
  });
});
it.each([
  ['pricing', []],
  ['brochure', ['brochure']],
  ['video', ['video']],
  ['brochure video', ['brochure', 'video']],
  ['missing brochure', ['unavailable']],
])('mock %s', async (q, kinds) => {
  const result = await runPipeline(request(q as string), { mock: true });
  expect(result.mode).toBe('mock');
  expect(result.media.map((m) => m.kind)).toEqual(kinds);
  expect(result.text).toContain('[MOCK DEMO]');
});
it('does not guess unknown answers', async () => {
  expect(
    (await runPipeline(request('quantum unicorn'), { mock: true })).text,
  ).toContain('I do not have that information');
});
it.each(['retired', 'unknown-asset'])(
  'resolves explicitly requested %s rather than substituting brochure',
  async (id) => {
    const trace = await runPipeline(
      request(`Send the PDF brochure with id ${id}.`),
      { mock: true },
    );
    expect(trace.media).toHaveLength(1);
    expect(trace.media[0]).toMatchObject({ kind: 'unavailable', id, url: '' });
    expect(trace.toolCalls[0]?.input.id).toBe(id);
    expect(trace.text).toContain('unavailable');
  },
);
it('resolves an explicitly requested available video ID through its registry type', async () => {
  const trace = await runPipeline(request('Send asset id video.'), {
    mock: true,
  });
  expect(trace.media).toHaveLength(1);
  expect(trace.media[0]).toMatchObject({ kind: 'video', id: 'video' });
});
it('rejects invalid and oversized history', () => {
  for (const bad of [
    {},
    { messages: [] },
    request('x'.repeat(4001)),
    request(''),
  ])
    expect(chatRequestSchema.safeParse(bad).success).toBe(false);
});
it('sanitizes model errors', () => {
  expect(mapError(new Error('secret key')).message).not.toContain('secret');
  expect(mapError(new Error()).code).toBe('MODEL_FAILURE');
  expect(mapError(new DOMException('deadline', 'TimeoutError')).code).toBe(
    'TIMEOUT',
  );
});
