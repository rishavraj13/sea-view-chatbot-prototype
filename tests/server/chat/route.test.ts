import { expect, it } from 'vitest';
import { APICallError, readUIMessageStream } from 'ai';
import { POST } from '../../../src/app/api/chat/route';
import { chatRequestSchema, mapError } from '../../../src/server/chat';
import { modelMetadataSchema } from '../../../src/server/config';
it('streams both tools and accepts the returned assistant history', async () => {
  const request = {
    messages: [
      {
        id: 'u',
        role: 'user',
        parts: [{ type: 'text', text: 'brochure video' }],
      },
    ],
  };
  const response = await POST(
    new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
  );
  expect(response.headers.get('x-vercel-ai-ui-message-stream')).toBe('v1');
  const wire = await response.text();
  expect(wire).toContain('tool-output-available');
  expect(wire).toContain('[DONE]');
  expect(wire).toContain('"mode":"mock"');
  const events = wire
    .split('\n\n')
    .filter((l) => l.startsWith('data: {'))
    .map((l) => JSON.parse(l.slice(6)));
  const stream = new ReadableStream({
    start(controller) {
      for (const e of events) controller.enqueue(e);
      controller.close();
    },
  });
  let last;
  for await (const message of readUIMessageStream({ stream })) last = message;
  expect(last?.parts.filter((p) => p.type.startsWith('tool-'))).toHaveLength(2);
  expect(modelMetadataSchema.parse(last?.metadata)).toEqual({
    mode: 'mock',
    provider: 'google',
    modelId: 'gemini-2.5-flash',
  });
  expect(
    chatRequestSchema.safeParse({
      messages: [
        ...request.messages,
        last,
        { id: 'u2', role: 'user', parts: [{ type: 'text', text: 'pricing' }] },
      ],
    }).success,
  ).toBe(true);
});
it('rejects malformed JSON safely', async () => {
  const response = await POST(
    new Request('http://localhost/api/chat', { method: 'POST', body: '{' }),
  );
  expect(response.status).toBe(400);
  expect((await response.json()).error.code).toBe('INVALID_INPUT');
});
it('maps provider rate limits', () => {
  expect(
    mapError(
      new APICallError({
        message: 'private',
        url: 'https://provider.invalid',
        requestBodyValues: {},
        statusCode: 429,
      }),
    ).code,
  ).toBe('RATE_LIMIT');
});
