import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('docs/examples', { recursive: true });
for (const [name, path, body] of [
  [
    'chat',
    '/api/chat',
    {
      messages: [
        {
          id: 'demo',
          role: 'user',
          parts: [{ type: 'text', text: 'brochure video pricing' }],
        },
      ],
    },
  ],
  ['trace', '/api/knowledge/trace', { question: 'brochure video pricing' }],
  ['sources', '/api/knowledge/sources', null],
  ['invalid', '/api/chat', { messages: [] }],
]) {
  const response = await fetch(`http://127.0.0.1:3000${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  await writeFile(
    `docs/examples/${name}.txt`,
    `${body ? 'POST' : 'GET'} ${path}\nRequest: ${JSON.stringify(body)}\nStatus: ${response.status}\nContent-Type: ${response.headers.get('content-type')}\n\n${text}`,
  );
  console.log(name, response.status);
}
