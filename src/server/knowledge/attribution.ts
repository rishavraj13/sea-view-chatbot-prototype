import type { Chunk } from './index';
import { retrievalTokens } from './tokens';

const nonContent = new Set(
  'by us into out up down over under between during through until without within before after once may might must shall package yes no not only all any some from to then than also so as but because while either each more most other another same per person people their they them there here such already just regarding whether stated state explicitly describes describe provided facts source sources context retrieved section sections cite citation citations reference references ref see information know cannot cant dont do does didnt im now have has had been being are is was were be of the a an with and for on at in its our your this that'.split(
    ' ',
  ),
);

function contentWords(text: string): Set<string> {
  return new Set(
    [
      ...retrievalTokens(
        text
          .replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s<>"\]]+/gi, '')
          .replace(
            /\b(?:who|whose|what|whats|which|where|when|why|how)\b/gi,
            '',
          )
          .replace(/\b(?:baht|thb)\b/gi, 'price'),
      ),
    ].filter((word) => !nonContent.has(word) && !/^\d+$/.test(word)),
  );
}

/** Public offline evidence for lexical overlap; not a semantic entailment score. */
export interface SourceOverlap {
  answerWords: string[];
  chunkWords: string[];
  matchedWords: string[];
  overlap: number;
}

/** Measures the overlap coefficient after shared lexical normalization, with URLs/stop/question words excluded. */
export function measureSourceOverlap(
  answerText: string,
  chunk: Chunk,
): SourceOverlap {
  const answer = contentWords(answerText);
  const body = contentWords(chunk.text);
  const matchedWords = [...answer].filter((word) => body.has(word)).sort();
  const denominator = Math.min(answer.size, body.size);
  return {
    answerWords: [...answer].sort(),
    chunkWords: [...body].sort(),
    matchedWords,
    overlap: denominator ? matchedWords.length / denominator : 0,
  };
}

/** Highest tested coefficient retaining all positive calibration pairs; see the committed answer/chunk evidence table. */
export const ATTRIBUTION_MIN_OVERLAP = 0.5;
/** A single generic/shared word is insufficient evidence, even when its coefficient is one. */
export const ATTRIBUTION_MIN_WORDS = 2;

/** Pure lexical attribution: at most two supporting retrieved chunks, ranked by overlap and deduplicated by URL. */
export function attributeSources(
  answerText: string,
  retrievedChunks: readonly Chunk[],
): Chunk[] {
  const ranked = retrievedChunks
    .map((chunk, index) => ({
      chunk,
      index,
      ...measureSourceOverlap(answerText, chunk),
    }))
    .filter(
      (candidate) =>
        candidate.matchedWords.length >= ATTRIBUTION_MIN_WORDS &&
        candidate.overlap >= ATTRIBUTION_MIN_OVERLAP,
    )
    .sort((a, b) => b.overlap - a.overlap || a.index - b.index);
  const seen = new Set<string>();
  return ranked
    .filter((candidate) => {
      if (seen.has(candidate.chunk.source.url)) return false;
      seen.add(candidate.chunk.source.url);
      return true;
    })
    .slice(0, 2)
    .map((candidate) => candidate.chunk);
}
