import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { readEnv } from '../src/server/config/index.ts';
const env = readEnv();
if (!env.GROQ_API_KEY) throw Error('Groq key missing; no request made');
const directory = 'docs/examples/rate-limit-diagnostics';
await mkdir(directory, { recursive: true });
const ledger = `${directory}/direct-budget.json`;
try {
  await readFile(ledger);
  throw Error('The one-request diagnostic budget has already been used');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
await writeFile(
  ledger,
  JSON.stringify(
    {
      calls: 1,
      maxCalls: 1,
      modelId: 'qwen/qwen3.8-27b',
      maxTokens: 1,
      startedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
const response = await fetch(
  'https://api.groq.com/openai/v1/chat/completions',
  {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.8-27b',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 1,
      reasoning_effort: 'none',
      stream: false,
    }),
  },
);
const secretValues = [
  env.GROQ_API_KEY,
  env.GOOGLE_GENERATIVE_AI_API_KEY,
  env.OPENROUTER_API_KEY,
].filter(Boolean);
const safe = (value) =>
  typeof value === 'string' &&
  !secretValues.some((secret) => value.includes(secret)) &&
  !/(?:gsk_|AIza|sk-(?:or-)?v1-|Bearer\s+)[A-Za-z0-9_-]+/i.test(value);
const headers = Object.fromEntries(
  [...response.headers].filter(
    ([name, value]) =>
      (name === 'retry-after' || name.startsWith('x-ratelimit-')) &&
      safe(value),
  ),
);
const result = { httpStatus: response.status, headers };
if (!response.ok) {
  const parsed = z
    .object({
      error: z.object({
        type: z.string().nullable().optional(),
        code: z.union([z.string(), z.number()]).nullable().optional(),
        message: z.string(),
      }),
    })
    .safeParse(await response.json().catch(() => null));
  const error = parsed.success
    ? parsed.data.error
    : {
        type: null,
        code: null,
        message: 'Unrecognized provider error; body withheld',
      };
  result.error = Object.fromEntries(
    Object.entries(error).map(([name, value]) => [
      name,
      value === null || typeof value === 'number' || safe(value)
        ? value
        : '[withheld: potential key material]',
    ]),
  );
}
await writeFile(
  `${directory}/direct-response.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
