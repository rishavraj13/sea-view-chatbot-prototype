import { z } from 'zod';
import { sourceSchema, toolOutputSchema } from '../chat/schemas';
export { errorEnvelopeSchema as knowledgeErrorSchema } from '../chat/api-error';

const publicUrl = z
  .url()
  .refine((value) => new URL(value).protocol === 'https:');
const assetUrl = z.string().refine((value) => {
  if (value === '') return true;
  try {
    const url = new URL(value, 'https://www.greedyadventures.com');
    return url.protocol === 'https:' && !value.startsWith('//');
  } catch {
    return false;
  }
});
export const knowledgeSourceSchema = z.object({
  title: z.string(),
  url: publicUrl,
  capturedAt: z.iso.date(),
  text: z.string(),
  isDemo: z.boolean(),
});
export const knowledgeMediaSchema = z.object({
  id: z.string(),
  type: z.enum(['pdf', 'video']),
  title: z.string(),
  url: assetUrl,
  isDemo: z.boolean(),
  available: z.boolean(),
  posterUrl: publicUrl.optional(),
});
export const knowledgeSourcesSchema = z.object({
  isDemo: z.boolean(),
  sources: z.array(knowledgeSourceSchema),
  media: z.array(knowledgeMediaSchema),
});
export const traceResponseSchema = z.object({
  mode: z.enum(['live', 'mock']),
  provider: z.enum(['google', 'groq', 'openrouter']),
  modelId: z.string(),
  isDemo: z.boolean(),
  context: z.string(),
  text: z.string(),
  chunks: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      score: z.number().finite(),
      source: knowledgeSourceSchema,
    }),
  ),
  toolCalls: z.array(
    z.object({
      name: z.enum(['sendBrochure', 'showVideo']),
      input: z.object({ id: z.string() }),
      result: toolOutputSchema,
    }),
  ),
  media: z.array(toolOutputSchema),
  citations: z.array(sourceSchema),
});
export type KnowledgeSourcesResponse = z.infer<typeof knowledgeSourcesSchema>;
export type KnowledgeSource = z.infer<typeof knowledgeSourceSchema>;
export type KnowledgeMediaItem = z.infer<typeof knowledgeMediaSchema>;
export type TraceResponse = z.infer<typeof traceResponseSchema>;
