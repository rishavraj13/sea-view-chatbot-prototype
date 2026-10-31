import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const saved = vi.hoisted(() => new Map<string, string>());
vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(async () => undefined),
  readFile: vi.fn(async () => {
    throw Object.assign(new Error('MOCK absent campaign'), { code: 'ENOENT' });
  }),
  writeFile: vi.fn(async (path: string, text: string) => {
    saved.set(path, text);
  }),
}));
import { runProductionSmoke } from '../../../scripts/verify-production.mjs';
beforeEach(() => {
  saved.clear();
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
});
afterEach(() => {
  process.exitCode = 0;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('OFFLINE MOCK 429 stops after one request, saves quota headers and never retries', async () => {
  const fetch = vi.fn(async () =>
    Response.json(
      {
        mode: 'live',
        provider: 'groq',
        modelId: 'qwen/qwen3.8-27b',
        error: { code: 'RATE_LIMIT', message: 'MOCK quota exhausted.' },
      },
      {
        status: 429,
        headers: {
          'retry-after': '60',
          'x-ratelimit-limit-tokens': '8000',
          'x-ratelimit-remaining-tokens': '0',
        },
      },
    ),
  );
  vi.stubGlobal('fetch', fetch);
  await runProductionSmoke(['--base-url', 'https://mock.invalid']);
  expect(fetch).toHaveBeenCalledTimes(1);
  const ledger = JSON.parse(
    [...saved].find(([path]) => path.endsWith('budget.json'))![1],
  );
  expect(ledger).toMatchObject({
    cap: 8,
    minimumSpacingMs: 10000,
    calls: 1,
    stopped429: true,
  });
  const records = JSON.parse(
    [...saved].find(([path]) => path.endsWith('results.json'))![1],
  );
  expect(records).toHaveLength(1);
  expect(records[0].rateLimitHeaders).toEqual({
    'retry-after': '60',
    'x-ratelimit-limit-tokens': '8000',
    'x-ratelimit-remaining-tokens': '0',
  });
  expect(records[0].rawProviderAnswer).toBeNull();
  expect(process.exitCode).toBe(1);
});
