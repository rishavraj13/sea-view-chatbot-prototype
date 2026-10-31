import { expect, it } from 'vitest';
import {
  evaluateGrounding,
  presentCitations,
  runPipeline,
} from '../../../src/server/chat';
import { retrieve, citationSchema } from '../../../src/server/knowledge';

const chunks = retrieve('VIP price');
const url = chunks[0]!.source.url;
it.each([
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
  'VIP is ฿14,000 per person.',
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
it('deduplicates cited URLs and does not promote uncited retrieved sections', () => {
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
