import type { MediaResult } from '../media';
/** Pure summary of registry output only; does not infer offers, policies, or availability. */
export function summarizeMedia(media: readonly MediaResult[]): string {
  return media
    .map((m) =>
      m.kind === 'unavailable'
        ? `${m.title}: unavailable.`
        : `${m.isDemo ? 'DEMO ' : ''}${m.title}: ${m.url}`,
    )
    .join('\n');
}
