import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import {
  chatRequestSchema,
  buildSystemPrompt,
  buildModelMessages,
} from '../src/server/chat/index.ts';
import {
  retrieve,
  buildModelContext,
  buildRetrievalQuery,
} from '../src/server/knowledge/index.ts';

const captures = z
  .array(
    z.object({
      id: z.string(),
      request: chatRequestSchema,
      message: z.unknown().optional(),
      rawAnswer: z.string(),
    }),
  )
  .parse(
    JSON.parse(
      await readFile(
        'docs/examples/media-gating/qwen-qwen3-8-27b-initial.json',
        'utf8',
      ),
    ),
  );
const follow = captures.find((r) => r.id === 'follow-up');
const vip = captures.find((r) => r.id === 'vip');
const replay = chatRequestSchema.parse({
  messages: [
    ...vip.request.messages,
    vip.message,
    follow.request.messages.at(-1),
  ],
});
if (JSON.stringify(replay) !== JSON.stringify(follow.request))
  throw Error('Saved harness history differs from the SDK message');
const system = buildSystemPrompt(
  buildModelContext(retrieve(buildRetrievalQuery(follow.request.messages))),
);
const old = follow.request.messages.map((message) => ({
  role: message.role,
  content: message.parts
    .map((part) => (part.type === 'text' ? part.text : JSON.stringify(part)))
    .join('\n'),
}));
const diagnosis = {
  evidence:
    'OFFLINE reconstruction from the exact saved SDK history and preceding committed conversion. The previous HTTP request body was not captured; this is not a newly observed provider request.',
  cause:
    '(a) application history-to-model conversion in runPipeline; harness retained the correct SDK message object',
  sdkHistoryMatchesSavedRequest: true,
  request: follow.request,
  previousProviderMessages: [{ role: 'system', content: system }, ...old],
  correctedProviderMessages: [
    { role: 'system', content: system },
    ...buildModelMessages(follow.request.messages),
  ],
};
await mkdir('docs/examples/history-revision', { recursive: true });
await writeFile(
  'docs/examples/history-revision/history-diagnosis.json',
  JSON.stringify(diagnosis, null, 2),
);
console.log(JSON.stringify(diagnosis, null, 2));
