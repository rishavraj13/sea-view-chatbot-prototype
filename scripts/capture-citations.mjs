import { mkdir, writeFile } from 'node:fs/promises';
import { DefaultChatTransport, readUIMessageStream } from 'ai';
import { readEnv } from '../src/server/config/index.ts';
import { POST } from '../src/app/api/chat/route.ts';

if (readEnv().MODEL_MODE !== 'mock')
  throw Error('Explicit MODEL_MODE=mock required');
globalThis.fetch = async () => {
  throw Error('OFFLINE citation capture forbids provider calls');
};
let wire = '';
let status = 0;
const transport = new DefaultChatTransport({
  api: 'http://localhost/api/chat',
  fetch: async (input, init) => {
    const response = await POST(new Request(String(input), init));
    status = response.status;
    wire = await response.clone().text();
    return response;
  },
});
const request = {
  messages: [
    {
      id: 'citations-vip',
      role: 'user',
      parts: [{ type: 'text', text: 'How much is the VIP package?' }],
    },
  ],
};
const stream = await transport.sendMessages({
  trigger: 'submit-message',
  chatId: 'offline-citations',
  messages: request.messages,
  messageId: undefined,
  abortSignal: undefined,
});
let message;
for await (const part of readUIMessageStream({ stream })) message = part;
const output = {
  evidence:
    'OFFLINE MOCK actual chat route consumed by DefaultChatTransport + readUIMessageStream; zero provider calls',
  request,
  status,
  wire,
  message,
};
await mkdir('docs/examples/citations', { recursive: true });
await writeFile(
  'docs/examples/citations/chat-vip.json',
  JSON.stringify(output, null, 2),
);
console.log(
  'OFFLINE MOCK citation capture: HTTP ' +
    status +
    '; source parts=' +
    message.parts.filter((p) => p.type === 'source-url').length +
    '; zero provider calls.',
);
