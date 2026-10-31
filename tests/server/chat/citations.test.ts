import { expect, it } from 'vitest';
import {
  evaluateGrounding,
  presentCitations,
  runPipeline,
} from '../../../src/server/chat';
import { retrieve, citationSchema } from '../../../src/server/knowledge';
import live from '../../../docs/examples/live-provider/groq.json';

const chunks = retrieve('VIP price');
const url = chunks[0]!.source.url;
it.each([
  'Cite:',
  'Source:',
  'Sources:',
  'Reference:',
  'Ref:',
  'See:',
  '(source)',
  'Citation:',
  'References:',
  'Read more:',
])('removes directly attached label %s and punctuation', (label) => {
  for (const raw of [
    `VIP is ฿14,000 per person. ${label} [${url}].`,
    `${label} (${url}) VIP is ฿14,000 per person.`,
    `VIP is ฿14,000 per person. [${label} ${url}];`,
  ]) {
    expect(evaluateGrounding(raw, chunks).accepted).toBe(true);
    expect(presentCitations(raw, chunks).text).toBe(
      'VIP is ฿14,000 per person.',
    );
  }
});
it('replays the exact live VIP raw answer and removes its dangling Cite label', () => {
  const raw = live.find(
    (record) => record.question === 'How much is the VIP package?',
  )!.providerResponse!.rawAnswer;
  const guarded = evaluateGrounding(raw, chunks);
  expect(guarded.accepted).toBe(true);
  expect(presentCitations(guarded.text, chunks).text).toBe(
    'The VIP package is ฿14,000 per person.',
  );
});
it('preserves ordinary use of the word source away from citation markers', () => {
  expect(
    presentCitations(`Source wording says VIP. [${url}] (source).`, chunks)
      .text,
  ).toBe('Source wording says VIP.');
});
it('does not join factual words when removing a citation in the middle of a sentence', () => {
  expect(
    presentCitations(`The VIP [${url}] package is available.`, chunks).text,
  ).toBe('The VIP package is available.');
});
it.each([
  'VIP is ฿14,000 per person.',
  `VIP is ฿14,000 per person. [${url}]`,
  `(${url}) VIP is ฿14,000 per person.`,
  `<${url}> VIP is ฿14,000 per person.`,
  `VIP is ฿14,000 per person. ${url}`,
  `VIP is ฿14,000 per person. [source](${url})`,
  `[${url}](${url}) VIP is ฿14,000 per person.`,
  `VIP is ฿14,000 per person.\n[source]: ${url}`,
  `VIP is ฿14,000 per person.\n[source]: ${url}.`,
])('presents accepted citations separately for %s', (raw) => {
  const guard = evaluateGrounding(raw, chunks);
  expect(guard.accepted).toBe(true);
  const presented = presentCitations(guard.text, chunks);
  expect(presented.text).toContain('VIP is ฿14,000 per person.');
  expect(presented.text).not.toMatch(/https?:\/\/|\[\s*\]|\(\s*\)|<\s*>/);
  expect(presented.citations).toEqual([
    { type: 'source-url', sourceId: url, url, title: 'VIP' },
  ]);
  expect(citationSchema.array().parse(presented.citations)).toEqual(
    presented.citations,
  );
});
it.each([
  `VIP is ฿99,000 per person. [${url}]`,
  `VIP is ฿14,000 per person. [https://untrusted.invalid]`,
])('does not turn rejected prose into source parts: %s', (raw) => {
  const guard = evaluateGrounding(raw, chunks);
  expect(guard.accepted).toBe(false);
  expect(presentCitations(guard.text, chunks)).toEqual({
    text: 'I do not have that information.',
    citations: [],
  });
});
it('deduplicates attributed source URLs', () => {
  const raw = `VIP is ฿14,000. [${url}] (${url})`;
  expect(
    presentCitations(evaluateGrounding(raw, chunks).text, chunks).citations,
  ).toHaveLength(1);
});
it('unknown mock answers have no citations', async () => {
  const trace = await runPipeline(
    {
      messages: [
        {
          id: 'u',
          role: 'user',
          parts: [{ type: 'text', text: 'What is the weight limit?' }],
        },
      ],
    },
    { mock: true },
  );
  expect(trace.citations).toEqual([]);
});
