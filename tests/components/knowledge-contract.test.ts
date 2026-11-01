import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { z } from 'zod';
import {
  knowledgeSourcesSchema,
  traceResponseSchema,
  knowledgeErrorSchema,
} from '@/components/knowledge/schemas';
import { GET } from '../../src/app/api/knowledge/sources/route';
import { POST } from '../../src/app/api/knowledge/trace/route';
import { errorResponseSchema, traceRequestSchema } from '../../src/server/chat';
import { buildTraceRequest } from '@/components/knowledge/trace-input';

it('validates the real captured sources, trace and typed errors, including their file envelopes', () => {
  const read = (file: string): unknown =>
    JSON.parse(readFileSync(resolve('docs', 'examples', file), 'utf8'));
  expect(
    knowledgeSourcesSchema.parse(read('real-knowledge/sources.json')).sources
      .length,
  ).toBeGreaterThan(0);
  for (const name of ['vip', 'weather', 'eco-photos', 'unknown']) {
    const capture = z
      .object({ response: traceResponseSchema })
      .parse(read(`real-knowledge/trace-${name}.json`));
    expect(capture.response.mode).toBe('mock');
  }
  const errors = z
    .object({ captures: z.array(z.object({ body: knowledgeErrorSchema })) })
    .parse(read('chat-runtime/errors.json'));
  for (const capture of errors.captures)
    expect(errorResponseSchema.safeParse(capture.body).success).toBe(true);
});

it('parses actual local MOCK routes and captures current trace scenarios (no network/provider)', async () => {
  const catalog = knowledgeSourcesSchema.parse(await GET().json());
  expect(catalog.sources).toHaveLength(18);
  const forms = [
    {
      question: 'Can you send me a brochure?',
      earlierUser: '',
      earlierAssistant: '',
    },
    {
      question: "and what's included?",
      earlierUser: 'How much is the VIP package?',
      earlierAssistant: 'The VIP package costs ฿14,000 per person.',
    },
    {
      question: 'Send me the retired brochure asset id retired',
      earlierUser: '',
      earlierAssistant: '',
    },
    {
      question: 'What is the age limit?',
      earlierUser: '',
      earlierAssistant: '',
    },
  ];
  const captures = [];
  for (const form of forms) {
    const request = buildTraceRequest(form);
    expect(traceRequestSchema.safeParse(request).success).toBe(true);
    const response = await POST(
      new Request('http://localhost/api/knowledge/trace', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    );
    expect(response.status).toBe(200);
    const data = traceResponseSchema.parse(await response.json());
    expect(data.mode).toBe('mock');
    captures.push({
      submitted: form,
      request,
      status: response.status,
      response: data,
    });
  }
  expect(captures[0]?.response.toolCalls[0]?.name).toBe('sendBrochure');
  expect(
    captures[1]?.response.chunks.some((chunk) => chunk.source.title === 'VIP'),
  ).toBe(true);
  expect(
    captures[2]?.response.media.some((media) => media.kind === 'unavailable'),
  ).toBe(true);
  expect(captures[3]?.response.chunks).toEqual([]);
  const dir = resolve('node_modules', '.cache', 'knowledge-view');
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    resolve(dir, 'captures.json'),
    JSON.stringify(
      {
        evidence:
          'OFFLINE MOCK actual route calls, no network/provider requests',
        catalog,
        captures,
      },
      null,
      2,
    ) + '\n',
  );
});

it.each([
  null,
  [],
  {},
  { sources: [], media: [] },
  { mode: 'mock', toolCalls: ['sendBrochure'] },
])('rejects unexpected response shapes', (value) => {
  expect(knowledgeSourcesSchema.safeParse(value).success).toBe(false);
  expect(traceResponseSchema.safeParse(value).success).toBe(false);
  expect(knowledgeErrorSchema.safeParse(value).success).toBe(false);
});
