import { mkdir, writeFile } from 'node:fs/promises';
import { POST as chat } from '../src/app/api/chat/route.ts';
import { POST as trace } from '../src/app/api/knowledge/trace/route.ts';
import { GET } from '../src/app/api/knowledge/sources/route.ts';
globalThis.fetch = async () => {
  throw Error('Offline example capture forbids provider calls');
};
const dir = 'docs/examples/real-knowledge';
await mkdir(dir, { recursive: true });
const sourceResponse = GET();
await writeFile(
  `${dir}/sources.json`,
  JSON.stringify(await sourceResponse.json(), null, 2),
);
for (const [name, question] of [
  ['vip', 'How much is the VIP package?'],
  ['weather', 'What if it rains?'],
  ['eco-photos', 'Do I get photos with ECO?'],
  ['unknown', 'What is the Bangkok pickup price?'],
]) {
  const request = { question };
  const response = await trace(
    new Request('http://localhost/api/knowledge/trace', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
  );
  const body = await response.json();
  if (body.mode !== 'mock' || response.status !== 200)
    throw Error('Expected offline mock evidence');
  await writeFile(
    `${dir}/trace-${name}.json`,
    JSON.stringify(
      {
        evidence: 'OFFLINE MOCK actual route response',
        request,
        status: response.status,
        response: body,
      },
      null,
      2,
    ),
  );
}
const request = {
  messages: [
    {
      id: 'assets',
      role: 'user',
      parts: [{ type: 'text', text: 'Send brochure and video.' }],
    },
  ],
};
const response = await chat(
  new Request('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify(request),
  }),
);
await writeFile(
  `${dir}/chat-media.json`,
  JSON.stringify(
    {
      evidence: 'OFFLINE MOCK actual chat route response',
      status: response.status,
      contentType: response.headers.get('content-type'),
      body: await response.text(),
    },
    null,
    2,
  ),
);
console.log(
  'Captured public sources, four OFFLINE MOCK trace responses and media UIMessage SSE; zero provider calls.',
);
