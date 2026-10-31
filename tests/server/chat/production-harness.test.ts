import { expect, it } from 'vitest';
import { checkProductionScenario } from '../../../scripts/verify-production.mjs';
import { resolveMedia } from '../../../src/server/media';
const base = {
  status: 200,
  transportRequests: 1,
  message: {
    metadata: { mode: 'live', provider: 'groq', modelId: 'qwen/qwen3.8-27b' },
  },
  visibleText: 'Here is the brochure (demo material).',
  tools: [
    {
      type: 'tool-sendBrochure',
      state: 'output-available',
      output: resolveMedia('brochure', 'pdf'),
    },
  ],
  citations: [],
};
it('OFFLINE production checks accept a valid file stream without inventing provider-private evidence', () => {
  expect(
    checkProductionScenario({ tools: ['sendBrochure'] }, base).every(
      (check) => check.passed,
    ),
  ).toBe(true);
});
it.each([
  { ...base, status: 429 },
  { ...base, tools: [] },
  { ...base, transportRequests: 2 },
  {
    ...base,
    visibleText:
      'I do not have that information. Here is the brochure (demo material).',
  },
  { ...base, visibleText: 'Cite: https://bad.invalid' },
  { ...base, visibleText: '{"type":"source-url"}' },
  { ...base, message: { metadata: { mode: 'mock' } } },
])(
  'OFFLINE production assertions reject public regression evidence %#',
  (record) => {
    expect(
      checkProductionScenario({ tools: ['sendBrochure'] }, record).some(
        (check) => !check.passed,
      ),
    ).toBe(true);
  },
);
