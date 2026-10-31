import { z } from 'zod';
export { buildRetrievalQuery } from './query';
export type { QueryMessage } from './query';
export { buildModelContext } from './context';
import { retrievalTokens } from './tokens';
import eco from '../../../data/knowledge/eco.json';
import deluxe from '../../../data/knowledge/deluxe.json';
import vip from '../../../data/knowledge/vip.json';
import included from '../../../data/knowledge/included.json';
import plan from '../../../data/knowledge/plan.json';
import jump_facts from '../../../data/knowledge/jump-facts.json';
import location from '../../../data/knowledge/location.json';
import faq_location from '../../../data/knowledge/faq-location.json';
import faq_package from '../../../data/knowledge/faq-package.json';
import faq_pickup from '../../../data/knowledge/faq-pickup.json';
import weather from '../../../data/knowledge/weather.json';
import cancel from '../../../data/knowledge/cancel.json';
import no_show from '../../../data/knowledge/no-show.json';
import refunds from '../../../data/knowledge/refunds.json';
import insurance from '../../../data/knowledge/insurance.json';
import { unsupportedQuestion } from './coverage';
const sourceSchema = z.object({
  title: z.string(),
  url: z.url(),
  capturedAt: z.iso.date(),
  isDemo: z.boolean(),
  text: z.string(),
});
/** Public, dated website section with explicit provenance flag. */
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
  .parse([
    eco,
    deluxe,
    vip,
    included,
    plan,
    jump_facts,
    location,
    faq_location,
    faq_package,
    faq_pickup,
    weather,
    cancel,
    no_show,
    refunds,
    insurance,
  ]);
/** Unchanged minimum lexical evidence needed for a returned chunk. */
export const RETRIEVAL_THRESHOLD = 1;
/** Pure normalized keyword retrieval: text matches weigh 1, title evidence totals 2 across title tokens. */
export function retrieve(
  question: string,
  corpus: readonly Source[] = sources,
): Chunk[] {
  const query = retrievalTokens(question);
  if (query.has('weather')) query.delete('cancellation');
  if (unsupportedQuestion(query)) return [];
  const packageNames = ['eco', 'deluxe', 'vip'];
  const requested = packageNames.filter((name) => query.has(name));
  return corpus
    .filter(
      (source) =>
        !(
          query.has('price') &&
          !query.has('pickup') &&
          source.title === 'Is Bangkok pickup available?'
        ),
    )
    .filter(
      (source) =>
        !requested.length ||
        !packageNames.includes(source.title.toLowerCase()) ||
        requested.includes(source.title.toLowerCase()),
    )
    .map((source) => {
      const body = retrievalTokens(source.text);
      const title = retrievalTokens(source.title);
      return {
        id: source.title,
        text: source.text,
        source,
        score: [...query].reduce(
          (sum, token) =>
            sum +
            (body.has(token) ? 1 : 0) +
            (title.has(token) ? 2 / title.size : 0),
          0,
        ),
      };
    })
    .filter((c) => c.score >= RETRIEVAL_THRESHOLD)
    .sort(
      (a, b) =>
        b.score - a.score ||
        corpus.indexOf(a.source) - corpus.indexOf(b.source),
    )
    .slice(0, 3);
}
