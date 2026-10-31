import { z } from 'zod';
import manifest from '../../../data/media/manifest.json';
const base = {
  id: z.string(),
  title: z.string(),
  url: z.string(),
  isDemo: z.boolean(),
  posterUrl: z.url().optional(),
};
/** Discriminated payload consumed by assistant-ui tool renderers. */
export const mediaResultSchema = z.discriminatedUnion('kind', [
  z.object({ ...base, kind: z.literal('brochure'), type: z.literal('pdf') }),
  z.object({ ...base, kind: z.literal('video'), type: z.literal('video') }),
  z.object({
    ...base,
    kind: z.literal('unavailable'),
    reason: z.enum(['unknown', 'unavailable', 'wrong-type']),
  }),
]);
/** Validated tool result; unavailable URLs are empty and must not be rendered. */
export type MediaResult = z.infer<typeof mediaResultSchema>;
/** Public website video and explicitly demo-labelled PDF registry, bundled for serverless. */
export const registry = z
  .array(
    z.object({
      ...base,
      type: z.enum(['pdf', 'video']),
      available: z.boolean(),
    }),
  )
  .parse(manifest);
/** Resolves assets without inventing a URL. */
export function resolveMedia(
  id: string,
  type: 'pdf' | 'video',
  assets = registry,
): MediaResult {
  const asset = assets.find((a) => a.id === id);
  if (!asset || !asset.available || asset.type !== type)
    return {
      kind: 'unavailable',
      id,
      title: asset?.title ?? 'Unknown asset',
      url: '',
      isDemo: asset?.isDemo ?? false,
      reason: !asset
        ? 'unknown'
        : !asset.available
          ? 'unavailable'
          : 'wrong-type',
    };
  return mediaResultSchema.parse({
    ...asset,
    kind: type === 'pdf' ? 'brochure' : 'video',
  });
}
