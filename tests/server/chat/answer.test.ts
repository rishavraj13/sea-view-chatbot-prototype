import { expect, it } from 'vitest';
import { buildModelContext, retrieve } from '../../../src/server/knowledge';
import {
  buildSystemPrompt,
  evaluateGrounding,
  groundedAnswer,
} from '../../../src/server/chat';
const vip = retrieve('VIP price');
const facts = retrieve('How high is the jump?');
const page = 'https://www.greedyadventures.com/experiences/sea-view-skydiving';
it.each([
  `VIP is ฿14,000 per person. [${page}#options]`,
  `[${page}#options] The VIP package costs 14000 baht.`,
  `The VIP price is THB 14,000.00. [source](${page}#options)`,
])('accepts normalized cited price prose: %s', (text) => {
  expect(evaluateGrounding(text, vip).accepted).toBe(true);
  expect(groundedAnswer(text, vip, [])).not.toContain('I do not have');
});
it('builds exact real source context and preserves package contradictions in the prompt', () => {
  const context = buildModelContext(vip);
  expect(context).toBe(
    vip.map((c) => `[${c.source.url}] ${c.text}`).join('\n'),
  );
  const prompt = buildSystemPrompt(context);
  expect(prompt).toContain(
    `BEGIN_RETRIEVED_CONTEXT\n${context}\nEND_RETRIEVED_CONTEXT`,
  );
  expect(prompt).toContain('identical inclusions');
  expect(prompt).toContain('do not invent whether photos');
  expect(buildModelContext([])).toBe('');
});
it.each([
  'VIP costs 14001 baht.',
  'VIP costs 14000 USD.',
  'VIP costs €14000.',
  'VIP costs ₹14000.',
])(
  'rejects unsupported amount/currency even with an allowed citation: %s',
  (text) => {
    expect(evaluateGrounding(`${text} [${page}#options]`, vip).accepted).toBe(
      false,
    );
  },
);
it('requires at least one allowed URL and rejects every extra unknown citation', () => {
  for (const text of [
    'VIP is 14000 baht.',
    `VIP is 14000 baht. [https://untrusted.invalid]`,
    `[${page}#options] [other](https://untrusted.invalid)`,
    `[${page}#options] [other](/unknown)`,
  ])
    expect(evaluateGrounding(text, vip).accepted).toBe(false);
});
it('normalizes bounded number words, altitude and duration units', () => {
  const text = `Exit at 13000 feet; sixty seconds of freefall, five to seven minutes under canopy, and 3 hours at the dropzone. [${page}#details]`;
  expect(evaluateGrounding(text, facts).accepted).toBe(true);
});
it.each([
  '60 minutes of freefall',
  '13000 metres altitude',
  '13000 yards altitude',
  '60 weeks of freefall',
  '4 hours at the dropzone',
  '6 minutes under canopy',
  'one hundred seconds of freefall',
])('rejects unsupported quantity: %s', (text) => {
  expect(evaluateGrounding(`${text} [${page}#details]`, facts).accepted).toBe(
    false,
  );
});
it('retains only registry-controlled media fallback for an empty model step', () => {
  expect(
    groundedAnswer(
      '',
      [],
      [
        {
          kind: 'video',
          type: 'video',
          id: 'video',
          title: 'Website video',
          url: page,
          isDemo: false,
        },
      ],
    ),
  ).toBe('');
  expect(groundedAnswer('Here is a made-up claim.', [], [])).toBe(
    'I do not have that information.',
  );
});
it('documents the semantic limit: citation/numeric checks do not prove nonnumeric entailment', () => {
  expect(
    evaluateGrounding(
      `A purple dragon operates this jump. [${page}#options]`,
      vip,
    ).accepted,
  ).toBe(true);
});
