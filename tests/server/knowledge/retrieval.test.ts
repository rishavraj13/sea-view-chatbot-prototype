import { expect, it } from 'vitest';
import { retrieve } from '../../../src/server/knowledge';
it('ranks a named package price and rejects unrelated vocabulary', () => {
  expect(retrieve('VIP price')[0]?.source.title).toBe('VIP');
  expect(retrieve('quantum unicorn')).toEqual([]);
});
