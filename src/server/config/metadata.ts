import { z } from 'zod';
/** Public model selection metadata. Never contains credentials. */
export const modelMetadataSchema = z.object({
  mode: z.enum(['live', 'mock']),
  provider: z.enum(['google', 'groq', 'openrouter']),
  modelId: z.string().min(1).max(128),
});
/** Validated public model selection. */
export type ModelMetadata = z.infer<typeof modelMetadataSchema>;
