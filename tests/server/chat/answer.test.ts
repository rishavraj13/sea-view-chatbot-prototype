import { expect, it } from 'vitest';
import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { buildModelContext, retrieve } from '../../../src/server/knowledge';
import { buildSystemPrompt, groundedAnswer } from '../../../src/server/chat';
const diagnostic = z
  .object({ question: z.string(), modelText: z.string() })
  .parse(
    JSON.parse(
      readFileSync(
        new URL(
          '../../../docs/examples/covered-info/live-before.json',
          import.meta.url,
        ),
        'utf8',
      ),
    ),
  );
it('canonicalizes the exact live answer instead of falsely refusing its trailing citation', () => {
  const chunks = retrieve(diagnostic.question);
  const answer = groundedAnswer(diagnostic.modelText, chunks, []);
  expect(answer).toContain('USD 250');
  expect(answer).toContain('[https://example.com/sea-view-demo/pricing]');
  expect(answer).not.toContain('I do not have');
});
it('builds exact source context with no generated claims and uses it verbatim in the system prompt', () => {
  const chunks = retrieve(diagnostic.question);
  const context = buildModelContext(chunks);
  expect(context).toBe(
    chunks.map((c) => `[${c.source.url}] ${c.text}`).join('\n'),
  );
  const prompt = buildSystemPrompt(context);
  expect(prompt).toContain(
    `BEGIN_RETRIEVED_CONTEXT\n${context}\nEND_RETRIEVED_CONTEXT`,
  );
  expect(prompt).toContain(
    'ONLY when the context does not contain the requested answer',
  );
  expect(prompt).toContain('Do not refuse just because');
  expect(buildModelContext([])).toBe('');
});
it('does not turn invented facts, unsupported paraphrases or unknown URLs into grounded answers', () => {
  const chunks = retrieve(diagnostic.question);
  for (const answer of [
    'The price is USD 1. [https://example.com/sea-view-demo/pricing]',
    diagnostic.modelText.replace('example.com', 'unknown.invalid'),
    'The price is USD 250.',
  ])
    expect(groundedAnswer(answer, chunks, [])).toBe(
      'I do not have that information.',
    );
  expect(groundedAnswer(diagnostic.modelText, [], [])).toBe(
    'I do not have that information.',
  );
});
