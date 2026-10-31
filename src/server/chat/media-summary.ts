import type { MediaResult } from '../media';
/** Pure summary of registry output only; does not infer offers, policies, or availability. */
export function summarizeMedia(media: readonly MediaResult[]): string {
  return media
    .map((m) =>
      m.kind === 'unavailable'
        ? `${m.reason === 'unknown' ? "I couldn't find that file." : m.reason === 'wrong-type' ? "That file isn't available in the requested format." : "That file isn't available right now."}${m.isDemo ? ' (demo material)' : ''}`
        : `Here is ${m.title}${m.isDemo ? ' (demo material)' : ''}.`,
    )
    .join('\n');
}
