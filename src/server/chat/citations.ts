import { citationSchema, attributeSources } from '../knowledge';
import type { Chunk } from '../knowledge';
import {
  CITATION_MARKER,
  stripCitationPresentation,
} from './citation-presentation';

/** Builds server-attributed source parts and removes optional model URLs after successful grounding. */
export function presentCitations(answer: string, chunks: readonly Chunk[]) {
  const citations = attributeSources(answer, chunks).map((chunk) =>
    citationSchema.parse({
      type: 'source-url',
      sourceId: chunk.source.url,
      url: chunk.source.url,
      title: chunk.source.title,
    }),
  );
  const text = answer
    .replace(/^\s*\[[^\]\n]+\]:\s*(https?:\/\/\S+)\s*$/gm, CITATION_MARKER)
    .replace(
      /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g,
      (_match, label: string, url: string) => {
        return label === url ? CITATION_MARKER : `${label} ${CITATION_MARKER}`;
      },
    )
    .replace(/\bhttps?:\/\/[^\s<>"\]]+/gi, (match) => {
      const url = match.replace(/[).,;!?]+$/, '');
      return CITATION_MARKER + match.slice(url.length);
    });
  return { text: stripCitationPresentation(text), citations };
}
