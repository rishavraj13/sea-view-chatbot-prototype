import { citationSchema } from '../knowledge';
import type { Chunk, Citation } from '../knowledge';

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
    .replace(/^\s*\[[^\]\n]+\]:\s*(https?:\/\/\S+)\s*$/gm, '')
    .replace(
      /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g,
      (_match, label: string, url: string) => {
        return label === url ? '' : label;
      },
    )
    .replace(/\bhttps?:\/\/[^\s<>"\]]+/gi, (match) => {
      const url = match.replace(/[).,;!?]+$/, '');
      return match.slice(url.length);
    })
    .replace(/\[\s*\]|\(\s*\)|<\s*>/g, '')
    .replace(/[ \t]+([.,;!?])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/^[ \t]+|[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text, citations };
}
