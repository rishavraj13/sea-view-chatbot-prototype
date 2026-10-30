import { mkdir, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { z } from 'zod';
const base = z.url().parse(process.argv[2]);
const user = (text, id) => ({
  id,
  role: 'user',
  parts: [{ type: 'text', text }],
});
const followup = [
  user('What is the tandem package price?', 'prior'),
  {
    id: 'answer',
    role: 'assistant',
    parts: [{ type: 'text', text: 'The DEMO tandem price is USD 250.' }],
  },
  user('What does that include?', 'followup'),
];
const scenarios = [
  {
    name: 'unavailable',
    path: '/api/chat',
    body: { messages: [user('Send PDF brochure id retired.', 'unavailable')] },
  },
  {
    name: 'follow-up',
    path: '/api/knowledge/trace',
    body: { question: 'What does that include?', messages: followup },
  },
  {
    name: 'unknown',
    path: '/api/chat',
    body: {
      messages: [user('What is the quantum unicorn policy?', 'unknown')],
    },
  },
];
const records = [];
await mkdir('docs/examples/verification', { recursive: true });
for (const [i, item] of scenarios.entries()) {
  if (i) await new Promise((resolve) => setTimeout(resolve, 61000));
  const start = performance.now();
  const response = await fetch(`${base}${item.path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item.body),
  });
  records.push({
    ...item,
    status: response.status,
    latencyMs: Math.round(performance.now() - start),
    response: await response.text(),
  });
  await writeFile(
    'docs/examples/verification/approved-live.json',
    JSON.stringify(records, null, 2),
  );
  console.log(
    `${item.name}: HTTP ${response.status}, ${records.at(-1).latencyMs} ms; one attempt, no retries`,
  );
}
