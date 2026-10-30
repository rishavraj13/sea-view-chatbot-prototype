import { expect, it } from 'vitest';
import { retrieve } from '../../../src/server/knowledge';
it('ranks pricing and rejects unknown vocabulary', () => {
  expect(retrieve('pricing price')[0]?.source.title).toBe('Pricing');
  expect(retrieve('quantum unicorn')).toEqual([]);
});
