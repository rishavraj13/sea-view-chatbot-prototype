import { mkdir, writeFile } from 'node:fs/promises';
import { runPipeline } from '../src/server/chat/index.ts';
const user = (text, id) => ({
  id,
  role: 'user',
  parts: [{ type: 'text', text }],
});
const scenarios = [
  {
    name: 'unavailable',
    messages: [user('Send PDF brochure id retired.', 'unavailable')],
  },
  {
    name: 'follow-up',
    messages: [
      user('What is the tandem package price?', 'prior'),
      user('What does that include?', 'followup'),
    ],
  },
  {
    name: 'unknown',
    messages: [user('What is the quantum unicorn policy?', 'unknown')],
  },
];
const records = [];
for (const scenario of scenarios) {
  const result = await runPipeline(
    { messages: scenario.messages },
    { mock: true },
  );
  records.push({
    ...scenario,
    evidence: 'OFFLINE MOCK: no provider call',
    result,
  });
  console.log(
    `${scenario.name}: mode=${result.mode}, chunks=${result.chunks.length}, media=${result.media.map((m) => m.kind).join(',')}`,
  );
}
await mkdir('docs/examples/verification', { recursive: true });
await writeFile(
  'docs/examples/verification/approved-offline-mock.json',
  JSON.stringify(records, null, 2),
);
