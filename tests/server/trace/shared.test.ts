import { expect, it } from 'vitest';
import { runPipeline } from '../../../src/server/chat';
import { traceRequestSchema } from '../../../src/server/chat';
import { POST } from '../../../src/app/api/knowledge/trace/route';
it('trace returns the shared pipeline retrieval and media', async () => {
  const question = 'brochure video pricing';
  const expected = await runPipeline(
    {
      messages: [
        { id: '1', role: 'user', parts: [{ type: 'text', text: question }] },
      ],
    },
    { mock: true },
  );
  const response = await POST(
    new Request('http://localhost/api/knowledge/trace', {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(expected);
});
it('optional history uses the same pipeline and validates the same limits', async () => {
  const question = 'What does that include?';
  const messages = [
    {
      id: '1',
      role: 'user' as const,
      parts: [
        { type: 'text' as const, text: 'What is the tandem package price?' },
      ],
    },
    {
      id: '2',
      role: 'user' as const,
      parts: [{ type: 'text' as const, text: question }],
    },
  ];
  const response = await POST(
    new Request('http://localhost/api/knowledge/trace', {
      method: 'POST',
      body: JSON.stringify({ question, messages }),
    }),
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(
    await runPipeline({ messages }, { mock: true }),
  );
  for (const bad of [
    [],
    Array.from({ length: 31 }, () => messages[0]),
    [{ ...messages[0], parts: [{ type: 'text', text: 'x'.repeat(4001) }] }],
    [{ ...messages[0], role: 'assistant' }],
  ])
    expect(
      traceRequestSchema.safeParse({ question, messages: bad }).success,
    ).toBe(false);
});
