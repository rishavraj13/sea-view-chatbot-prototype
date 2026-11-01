import { z } from 'zod';

const link = z.string().refine((value) => {
  try {
    const url = new URL(value, 'https://www.greedyadventures.com');
    return url.protocol === 'https:' && !value.startsWith('//');
  } catch {
    return false;
  }
});
const base = {
  id: z.string(),
  title: z.string(),
  isDemo: z.boolean(),
  posterUrl: z.url().optional(),
};
export const toolOutputSchema = z.discriminatedUnion('kind', [
  z.object({
    ...base,
    kind: z.literal('brochure'),
    type: z.literal('pdf'),
    url: link,
  }),
  z.object({
    ...base,
    kind: z.literal('video'),
    type: z.literal('video'),
    url: link,
  }),
  z.object({
    ...base,
    kind: z.literal('unavailable'),
    url: z.literal(''),
    reason: z.enum(['unknown', 'unavailable', 'wrong-type']),
  }),
]);
export const sourceSchema = z.object({
  type: z.literal('source-url'),
  sourceId: z.string().min(1).max(2048),
  url: z.url().max(2048),
  title: z.string().max(512).optional(),
});
export const responseMetadataSchema = z.object({
  mode: z.enum(['mock', 'live']),
  provider: z.string().optional(),
  modelId: z.string().optional(),
});
