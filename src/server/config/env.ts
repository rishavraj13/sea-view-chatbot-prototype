import { z } from 'zod';
const schema = z.object({
  MODEL_MODE: z.enum(['live', 'mock']).default('mock'),
  MODEL_PROVIDER: z.enum(['google', 'groq', 'openrouter']).default('google'),
  MODEL_ID: z
    .string()
    .trim()
    .min(1)
    .max(128)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9./:_-]*$/)
    .optional(),
  GROQ_API_KEY: z.string().trim().min(1).optional(),
  OPENROUTER_API_KEY: z.string().trim().min(1).optional(),
  GOOGLE_THINKING_BUDGET: z.coerce.number().int().min(0).max(24576).default(0),
  GOOGLE_THINKING_LEVEL: z
    .enum(['minimal', 'low', 'medium', 'high'])
    .default('low'),
  REASONING_EFFORT: z.enum(['none', 'low', 'medium', 'high']).default('low'),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().trim().min(1).optional(),
  GOOGLE_MODEL: z.string().min(1).default('gemini-2.5-flash'),
});
/** Validates configuration; this is the sole environment reader. */
export function readEnv() {
  return schema.parse({
    MODEL_MODE: process.env.MODEL_MODE,
    MODEL_PROVIDER: process.env.MODEL_PROVIDER,
    MODEL_ID: process.env.MODEL_ID || undefined,
    GROQ_API_KEY: process.env.GROQ_API_KEY || undefined,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || undefined,
    GOOGLE_THINKING_BUDGET: process.env.GOOGLE_THINKING_BUDGET || undefined,
    GOOGLE_THINKING_LEVEL: process.env.GOOGLE_THINKING_LEVEL || undefined,
    REASONING_EFFORT: process.env.REASONING_EFFORT || undefined,
    GOOGLE_GENERATIVE_AI_API_KEY:
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || undefined,
    GOOGLE_MODEL: process.env.GOOGLE_MODEL,
  });
}
