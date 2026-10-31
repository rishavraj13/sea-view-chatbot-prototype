import { citationSchema } from '../knowledge';
import type { Chunk, Citation } from '../knowledge';
import {
  CITATION_MARKER,
  stripCitationPresentation,
} from './citation-presentation';

/** Moves validated source URLs out of prose; call only after grounding has accepted the original answer. */
export function presentCitations(
  answer: string,
  chunks: readonly Chunk[],
): { text: string; citations: Citation[] } {
  const citations: Citation[] = [];
  const seen = new Set<string>();
  const remember = (url: string) => {
    const chunk = chunks.find((item) => item.source.url === url);
    if (!chunk || seen.has(url)) return;
    seen.add(url);
    citations.push(
      citationSchema.parse({
        type: 'source-url',
        sourceId: url,
        url,
        title: chunk.source.title,
      }),
    );
  };
  for (const match of answer.matchAll(/\b[a-z][a-z0-9+.-]*:\/\/[^\s<>"\]]+/gi))
    remember(match[0].replace(/[).,;!?]+$/, ''));
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
