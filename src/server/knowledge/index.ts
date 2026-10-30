import { z } from 'zod';
export { buildRetrievalQuery } from './query';
export type { QueryMessage } from './query';
import packages from '../../../data/knowledge/packages.json';
import pricing from '../../../data/knowledge/pricing.json';
import safety from '../../../data/knowledge/safety.json';
import weather from '../../../data/knowledge/weather.json';
import booking from '../../../data/knowledge/booking.json';
const sourceSchema = z.object({
  title: z.string(),
  url: z.url(),
  capturedAt: z.iso.datetime(),
  text: z.string(),
});
/** Public demo knowledge source. */
export type Source = z.infer<typeof sourceSchema>;
/** Ranked exact context fragment and its public source. */
export interface Chunk {
  id: string;
  text: string;
  score: number;
  source: Source;
}
/** Bundled, validated JSON; independent of server working directory. */
export const sources = z
  .array(sourceSchema)
  .parse([packages, pricing, safety, weather, booking]);
const tokens = (s: string) =>
  [...new Set(s.toLowerCase().match(/[a-z0-9]+/g) ?? [])].filter(
    (t) =>
      ![
        'the',
        'a',
        'is',
        'what',
        'how',
        'do',
        'i',
        'and',
        'can',
        'you',
        'me',
        'please',
        'your',
        'about',
        'it',
      ].includes(t),
  );
/** Pure keyword retrieval, minimum one discriminating token, deterministic top three. */
export function retrieve(
  question: string,
  corpus: readonly Source[] = sources,
): Chunk[] {
  const query = tokens(question);
  return corpus
    .flatMap((source, si) =>
      source.text
        .split(/\n+/)
        .filter(Boolean)
        .map((text, ci) => ({
          id: `${si}-${ci}`,
          text,
          source,
          score: query.reduce(
            (sum, t) =>
              sum + (tokens(source.title + ' ' + text).includes(t) ? 1 : 0),
            0,
          ),
        })),
    )
    .filter((c) => c.score >= 1)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 3);
}
