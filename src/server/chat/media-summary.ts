import type { MediaResult } from '../media';
/** Pure summary of registry output only; does not infer offers, policies, or availability. */
export function summarizeMedia(media: readonly MediaResult[]): string {
  return media
    .map((m) =>
      m.kind === 'unavailable'
        ? "That file isn't available right now."
        : `Here is the ${m.kind}${m.isDemo ? ' (demo material)' : ''}.`,
    )
    .join('\n');
}
