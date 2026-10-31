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
