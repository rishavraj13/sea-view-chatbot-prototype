import { expect, it } from 'vitest';
import { checkScenario } from '../../../scripts/live-scenarios.mjs';

const base = {
  status: 200,
  providerCalls: 1,
  visibleText: 'The package includes the listed jump experience.',
  citations: [
    {
      type: 'source-url',
      url: 'https://www.greedyadventures.com/experiences/sea-view-skydiving#options',
    },
  ],
  tools: [],
  rawToolCalls: [],
};
it.each(['context', 'retrieved', 'sources', 'source', 'section'])(
  'live check rejects customer-facing metadata word %s',
  (word) => {
    expect(
      checkScenario(
        { fact: true },
        { ...base, visibleText: `The ${word} says the package is available.` },
      ).some(
        (check) =>
          check.name ===
            'customer-facing language has no retrieval terminology' &&
          !check.passed,
      ),
    ).toBe(true);
  },
);
it('live factual checks reject missing citations, leaked URLs and an unwanted tool', () => {
  for (const changed of [
    { ...base, citations: [] },
    { ...base, visibleText: base.visibleText + ' Cite: https://bad.invalid' },
    { ...base, rawToolCalls: [{ function: { name: 'sendBrochure' } }] },
  ])
    expect(
      checkScenario({ fact: true }, changed).some((check) => !check.passed),
    ).toBe(true);
  expect(
    checkScenario({ fact: true }, base).every((check) => check.passed),
  ).toBe(true);
});
it('live refusal checks reject factual-looking prose for missing knowledge', () => {
  expect(
    checkScenario({ refuse: true }, base).some((check) => !check.passed),
  ).toBe(true);
  expect(
    checkScenario(
      { refuse: true },
      {
        ...base,
        visibleText: 'I do not have that information.',
        citations: [],
      },
    ).every((check) => check.passed),
  ).toBe(true);
});
it.each([
  '{"type":"step-start"}',
  'sourceId leaked',
  'step-start leaked',
  'source-url leaked',
])('live checks reject serialized history visible as %s', (text) => {
  expect(
    checkScenario({ fact: true }, { ...base, visibleText: text }).some(
      (check) =>
        check.name === 'no serialized UI message parts' && !check.passed,
    ),
  ).toBe(true);
});
it('requires terminal punctuation on non-refusal factual prose', () => {
  expect(
    checkScenario(
      { fact: true },
      { ...base, visibleText: 'An answer without punctuation' },
    ).some(
      (check) =>
        check.name === 'factual answer has terminal punctuation' &&
        !check.passed,
    ),
  ).toBe(true);
});
it.each([
  ['I do not have that information.', true],
  ['ECO is described as the jump, nothing else.', true],
  ['ECO includes photos.', false],
  ['Photos are included with ECO.', false],
  ['I cannot confirm whether ECO includes photos.', true],
  ['Does ECO include photos? I do not have that information.', true],
])('ECO wording check: %s -> %s', (text, expected) => {
  const record = {
    ...base,
    visibleText: text,
    citations: text === 'I do not have that information.' ? [] : base.citations,
  };
  expect(
    checkScenario({ ecoPhotos: true }, record).every((check) => check.passed),
  ).toBe(expected);
});
it('rejects a refusal beside a successful or unavailable media result', () => {
  for (const kind of ['brochure', 'unavailable'])
    expect(
      checkScenario(
        { tools: ['sendBrochure'] },
        {
          ...base,
          visibleText: 'I do not have that information. Here is the brochure.',
          tools: [
            {
              type: 'tool-sendBrochure',
              output: { kind, id: 'brochure', isDemo: true },
            },
          ],
          rawToolCalls: [{ function: { name: 'sendBrochure' } }],
        },
      ).some(
        (check) =>
          check.name === 'no refusal beside a media result' && !check.passed,
      ),
    ).toBe(true);
});
