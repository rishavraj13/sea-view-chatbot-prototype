import { z } from 'zod';
const schema = z.object({
  MODEL_MODE: z.enum(['live', 'mock']).default('mock'),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().trim().min(1).optional(),
  GOOGLE_MODEL: z.string().min(1).default('gemini-2.5-flash'),
});
/** Validates configuration; this is the sole environment reader. */
export function readEnv() {
  return schema.parse({
    MODEL_MODE: process.env.MODEL_MODE,
    GOOGLE_GENERATIVE_AI_API_KEY:
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || undefined,
    GOOGLE_MODEL: process.env.GOOGLE_MODEL,
  });
}
