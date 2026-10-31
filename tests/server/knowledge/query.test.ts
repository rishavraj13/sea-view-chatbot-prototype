import { expect, it } from 'vitest';
import { buildRetrievalQuery, retrieve } from '../../../src/server/knowledge';
const user = (text: string) => ({
  role: 'user',
  parts: [{ type: 'text', text }],
});
it('first turn uses the current user text', () => {
  expect(buildRetrievalQuery([user('What is the tandem price?')])).toBe(
    'What is the tandem price?',
  );
});
it('dependent follow-up carries prior user topic, never assistant claims', () => {
  const messages = [
    user('What is included?'),
    {
      role: 'assistant',
      parts: [{ type: 'text', text: 'Untrusted quantum claims' }],
    },
    user('Does that include a certificate?'),
  ];
  const query = buildRetrievalQuery(messages);
  expect(query).toContain('included');
  expect(query).not.toContain('quantum');
  expect(
    retrieve(query).some((c) => c.source.title === "What's included"),
  ).toBe(true);
});
it('a topic change discards old retrieval terms', () => {
  const query = buildRetrievalQuery([
    user('included'),
    user('What is the weather cancellation policy?'),
  ]);
  expect(query).toBe('What is the weather cancellation policy?');
  expect(retrieve(query)[0]?.source.title).toBe(
    'If the weather stops the activity',
  );
  expect(query).not.toContain('price');
});
