import { expect, it } from 'vitest';
import { APICallError, DefaultChatTransport, readUIMessageStream } from 'ai';
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
it('DefaultChatTransport plus readUIMessageStream preserves text, tools, citations and resendable history', async () => {
  const messages = [
    {
      id: 'u',
      role: 'user' as const,
      parts: [
        {
          type: 'text' as const,
          text: 'How much is VIP? Send brochure and video.',
        },
      ],
    },
  ];
  const transport = new DefaultChatTransport({
    api: 'http://localhost/api/chat',
    fetch: async (input, init) =>
      POST(new Request(input instanceof Request ? input : String(input), init)),
  });
  const stream = await transport.sendMessages({
    trigger: 'submit-message',
    chatId: 'citations-test',
    messages,
    messageId: undefined,
    abortSignal: undefined,
  });
  let final;
  for await (const message of readUIMessageStream({ stream })) final = message;
  expect(final).toBeDefined();
  const citations = final!.parts.filter((part) => part.type === 'source-url');
  expect(citations.length).toBeGreaterThan(0);
  expect(citations[0]).toMatchObject({
    type: 'source-url',
    url: 'https://www.greedyadventures.com/experiences/sea-view-skydiving#options',
    title: 'VIP',
  });
  const text = final!.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
  expect(text).toContain('฿14,000');
  expect(text).not.toContain('greedyadventures.com/experiences/');
  expect(
    final!.parts.filter((part) => part.type.startsWith('tool-')),
  ).toHaveLength(2);
  expect(
    chatRequestSchema.safeParse({
      messages: [
        ...messages,
        final,
        {
          id: 'next',
          role: 'user',
          parts: [{ type: 'text', text: 'What does that include?' }],
        },
      ],
    }).success,
  ).toBe(true);
});
it('rejects invalid or oversized structured citations in supplied history', () => {
  const source = { type: 'source-url', sourceId: 'id', url: 'not-a-url' };
  for (const part of [
    source,
    { ...source, url: 'https://valid.invalid', sourceId: 'x'.repeat(2049) },
  ])
    expect(
      chatRequestSchema.safeParse({
        messages: [{ id: 'u', role: 'user', parts: [part] }],
      }).success,
    ).toBe(false);
});
