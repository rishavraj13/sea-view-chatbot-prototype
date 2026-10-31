import { z } from 'zod';
export { buildRetrievalQuery } from './query';
export type { QueryMessage } from './query';
export { buildModelContext } from './context';
import { retrievalTokens } from './tokens';
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
/** Unchanged minimum lexical evidence needed for a returned chunk. */
export const RETRIEVAL_THRESHOLD = 1;
/** Pure normalized keyword retrieval: text matches weigh 1, title evidence totals 2 across title tokens. */
export function retrieve(
  question: string,
  corpus: readonly Source[] = sources,
): Chunk[] {
  const query = retrievalTokens(question);
  return corpus
    .flatMap((source, si) =>
      source.text
        .split(/\n+/)
        .filter(Boolean)
        .map((text, ci) => {
          const body = retrievalTokens(text);
          const title = retrievalTokens(source.title);
          return {
            id: `${si}-${ci}`,
            text,
            source,
            score: [...query].reduce(
              (sum, t) =>
                sum +
                (body.has(t) ? 1 : 0) +
                (title.has(t) ? 2 / title.size : 0),
              0,
            ),
          };
        }),
    )
    .filter((c) => c.score >= RETRIEVAL_THRESHOLD)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 3);
}
