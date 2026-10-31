import { expect, it } from 'vitest';
import { hasMediaIntent } from '../../../src/server/chat';

export const intentCases = [
  ['What is included in the package?', false],
  ['Can you send me a brochure?', true],
  ['Can I see a video of the experience?', true],
  ['Send me the brochure and a video.', true],
  ['Brochure please', true],
  ['Send me the PDF', true],
  ['Show me a video', true],
  ['Are photos included?', false],
  ["and what's included?", false],
  ['How much is the VIP package?', false],
  ['What if it rains?', false],
  ['Show me the prices', false],
  ['Can I see the location?', false],
  ['Does ECO include photos?', false],
  ['Where do I meet?', false],
  ['Send some leaflets', true],
  ['A flyer please', true],
  ['Send pamphlets', true],
  ['Share documents', true],
  ['Show jump footage', true],
  ['Any clips?', true],
  ['A film please', true],
  ['I want to watch', true],
  ['Send recordings', true],
  ['Send PDFs', true],
  ['Are videographers included?', false],
] as const;
it.each(intentCases)('latest user intent: %s -> %s', (phrase, expected) => {
  expect(hasMediaIntent(phrase)).toBe(expected);
});
