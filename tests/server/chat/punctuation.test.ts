import { expect, it } from 'vitest';
import { evaluateGrounding, presentCitations } from '../../../src/server/chat';
import { retrieve } from '../../../src/server/knowledge';
import captures from '../../../docs/examples/media-gating/qwen-qwen3-8-27b-initial.json';

it.each(['rain', 'included', 'cancel'])(
  'preserves exact captured %s sentence punctuation after removing citations',
  (id) => {
    const capture = captures.find((r) => r.id === id)!;
    const chunks = retrieve(capture.question);
    const guard = evaluateGrounding(capture.rawAnswer, chunks);
    expect(guard.accepted).toBe(true);
    const text = presentCitations(guard.text, chunks).text;
    expect(text).not.toContain('https://');
    expect(text).toMatch(/[.!?]$/);
    if (id === 'rain')
      expect(text).toContain('anything paid. There is no charge');
    if (id === 'included') expect(text).toMatch(/certificate of completion\.$/);
    if (id === 'cancel') expect(text).toMatch(/latter\.$/);
  },
);
