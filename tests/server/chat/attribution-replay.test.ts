import { expect, it } from 'vitest';
import initial from '../../../docs/examples/history-revision/qwen-qwen3-8-27b-initial.json';
import rerun from '../../../docs/examples/history-revision/qwen-qwen3-8-27b-rerun.json';
import {
  chatRequestSchema,
  evaluateGrounding,
  presentCitations,
  groundedAnswer,
} from '../../../src/server/chat';
import {
  attributeSources,
  buildRetrievalQuery,
  retrieve,
} from '../../../src/server/knowledge';

it.each([
  [initial.find((r) => r.id === 'follow-up')!, 'VIP'],
  [rerun.find((r) => r.id === 'mixed')!, 'VIP'],
  [initial.find((r) => r.id === 'rain')!, 'If the weather stops the activity'],
  [initial.find((r) => r.id === 'cancel')!, 'If you cancel'],
  [
    initial.find((r) => r.id === 'altitude')!,
    'Jump facts: altitude, freefall, canopy, instructor and time',
  ],
  [initial.find((r) => r.id === 'vip')!, 'VIP'],
  [initial.find((r) => r.id === 'eco-photos')!, 'ECO'],
] as const)('exact raw attribution replay: $0.id', (capture, expected) => {
  const request = chatRequestSchema.parse(capture.request);
  const chunks = retrieve(buildRetrievalQuery(request.messages));
  const result = evaluateGrounding(capture.rawAnswer, chunks);
  expect(result.accepted).toBe(true);
  expect(
    attributeSources(result.text, chunks).map((c) => c.source.title),
  ).toContain(expected);
  expect(
    presentCitations(result.text, chunks).citations.map((c) => c.url),
  ).toContain(chunks.find((c) => c.source.title === expected)!.source.url);
});
it.each([
  'VIP costs ฿99,999 per person.',
  'Freefall lasts 999 seconds.',
  'Purple dragons sell coconut curry on Jupiter.',
  'VIP costs ฿14,000. https://fabricated.invalid/details',
])('fails closed for unsupported facts or foreign URL: %s', (raw) => {
  const chunks = retrieve('VIP package altitude freefall');
  expect(evaluateGrounding(raw, chunks).accepted).toBe(false);
  expect(groundedAnswer(raw, chunks, [])).toBe(
    'I do not have that information.',
  );
});
it('an allowed but unrelated model URL does not select the attributed source', () => {
  const vip = retrieve('VIP price').find((c) => c.source.title === 'VIP')!;
  const weather = retrieve('What if it rains?')[0]!;
  const chunks = [vip, weather];
  const result = evaluateGrounding(
    `VIP costs ฿14,000. ${weather.source.url}`,
    chunks,
  );
  expect(result.accepted).toBe(true);
  expect(
    presentCitations(result.text, chunks).citations.map((c) => c.url),
  ).toEqual([vip.source.url]);
});
it.each([
  {
    questions: ['How much is DELUXE?'],
    answer: 'DELUXE costs ฿12,500 per person.',
    expected: 'DELUXE',
  },
  {
    questions: ['How much is DELUXE?', "what's included?"],
    answer:
      'DELUXE lists video and photos included, and the listed inclusions include a tandem skydive and safety briefing.',
    expected: 'DELUXE',
  },
  {
    questions: ['What if it rains?', 'and can I get a refund?'],
    answer: 'If your flight is held for weather, you can take a full refund.',
    expected: 'If the weather stops the activity',
  },
])(
  'OFFLINE attribution-only evidence for quota-blocked chain: $expected',
  ({ questions, answer, expected }) => {
    const request = chatRequestSchema.parse({
      messages: questions.map((text, index) => ({
        id: `offline-${index}`,
        role: 'user',
        parts: [{ type: 'text', text }],
      })),
    });
    const chunks = retrieve(buildRetrievalQuery(request.messages));
    expect(evaluateGrounding(answer, chunks).accepted).toBe(true);
    expect(
      attributeSources(answer, chunks).map((chunk) => chunk.source.title),
    ).toContain(expected);
  },
);
