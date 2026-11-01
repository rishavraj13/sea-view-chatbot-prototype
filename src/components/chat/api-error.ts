import { z } from 'zod';
import { ERROR_MESSAGES } from '@/content';

export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.enum(['RATE_LIMIT', 'TIMEOUT', 'MODEL_FAILURE', 'INVALID_INPUT']),
    message: z.string(),
    retryAfterSeconds: z.number().int().min(1).max(3600).optional(),
  }),
  mode: z.enum(['mock', 'live']).optional(),
  provider: z.string().optional(),
  modelId: z.string().optional(),
});
export type ProductError = {
  code: keyof typeof ERROR_MESSAGES;
  retryAfterSeconds?: number;
  mode?: 'mock' | 'live';
};

/** Reads only validated public error fields, never a provider's error message. */
export function parseChatError(error: unknown): ProductError {
  if (!(error instanceof Error) || error.name === 'AbortError')
    return { code: 'UNKNOWN' };
  const upstream = z
    .object({ statusCode: z.number().int(), responseBody: z.string() })
    .safeParse(error);
  if (!upstream.success) return { code: 'UNKNOWN' };
  try {
    const body = errorEnvelopeSchema.safeParse(
      JSON.parse(upstream.data.responseBody),
    );
    if (!body.success) return { code: 'UNKNOWN' };
    return {
      code: body.data.error.code,
      mode: body.data.mode,
      ...(body.data.error.code === 'RATE_LIMIT' &&
      body.data.error.retryAfterSeconds !== undefined
        ? { retryAfterSeconds: body.data.error.retryAfterSeconds }
        : {}),
    };
  } catch {
    return { code: 'UNKNOWN' };
  }
}
export function errorCopy(error: ProductError): string {
  return ERROR_MESSAGES[error.code];
}
