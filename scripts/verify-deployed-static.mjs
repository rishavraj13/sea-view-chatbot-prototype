import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { strict as assert } from 'node:assert';
import { z } from 'zod';
import { sources } from '../src/server/knowledge/index.ts';
import { registry } from '../src/server/media/index.ts';
const [base, deployedCommit] = z
  .tuple([z.url(), z.string().regex(/^[a-f0-9]{40}$/)])
  .parse(process.argv.slice(2));
const baseUrl = new URL(base).origin;
const get = (path, init = {}) =>
  fetch(new URL(path, baseUrl), {
    ...init,
    credentials: 'omit',
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
  });
const checks = [];
const home = await get('/');
assert.equal(home.status, 200);
checks.push({ name: 'unauthenticated public homepage', status: home.status });
const publicResponse = await get('/api/knowledge/sources');
assert.equal(publicResponse.status, 200);
const publicData = await publicResponse.json();
assert.deepEqual(publicData, { isDemo: false, sources, media: registry });
assert.equal(publicData.sources.length, 18);
checks.push({
  name: 'public sources exactly match committed public knowledge/media; no extra fields or env values',
  status: 200,
  sections: 18,
});
const pdf = await get('/demo/brochure.pdf');
assert.equal(pdf.status, 200);
const signature = new TextDecoder().decode(
  new Uint8Array(await pdf.arrayBuffer()).slice(0, 5),
);
assert.equal(signature, '%PDF-');
checks.push({
  name: 'demo PDF',
  status: pdf.status,
  contentType: pdf.headers.get('content-type'),
  signature,
});
const videoUrl = registry.find((asset) => asset.id === 'video').url;
const video = await fetch(videoUrl, {
  method: 'HEAD',
  credentials: 'omit',
  redirect: 'error',
  signal: AbortSignal.timeout(20000),
});
assert.equal(video.status, 200);
assert.match(video.headers.get('content-type'), /^video\//i);
checks.push({
  name: 'external video HEAD only, no download',
  url: videoUrl,
  status: video.status,
  contentType: video.headers.get('content-type'),
});
const errorSchema = z
  .object({
    mode: z.literal('live'),
    provider: z.literal('groq'),
    modelId: z.literal('qwen/qwen3.8-27b'),
    error: z
      .object({ code: z.literal('INVALID_INPUT'), message: z.string() })
      .strict(),
  })
  .strict();
for (const route of ['/api/chat', '/api/knowledge/trace']) {
  const response = await get(route, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.equal(response.status, 400);
  const body = errorSchema.parse(await response.json());
  checks.push({
    name: `invalid ${route}; no pipeline/provider call`,
    status: response.status,
    body,
  });
}
const runtime = z
  .array(
    z.object({
      path: z.string(),
      runtime: z.string(),
      maxDuration: z.number(),
    }),
  )
  .parse(JSON.parse(await readFile('.vercel/production-runtime.json', 'utf8')));
for (const [path, seconds] of [
  ['api/chat', 30],
  ['api/knowledge/trace', 30],
  ['api/knowledge/sources', 10],
]) {
  const entry = runtime.find((item) => item.path === path);
  assert.ok(entry);
  assert.match(entry.runtime, /^nodejs/);
  assert.equal(entry.maxDuration, seconds);
}
checks.push({
  name: 'actual Vercel function runtime and maxDuration',
  functions: runtime,
});
const result = {
  evidence:
    'Production HTTP checks with ZERO model/provider calls; unauthenticated, no bypass headers/cookies',
  baseUrl,
  deployedCommit,
  checks,
  passed: true,
};
await mkdir('docs/examples/production-smoke', { recursive: true });
await writeFile(
  'docs/examples/production-smoke/static-checks.json',
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
