import { z } from 'zod';
import { modelMetadataSchema } from '../config';
import type { ModelMetadata } from '../config';
import type { ChatError } from './errors';
/** Public pre-stream error contract; only RATE_LIMIT can include bounded retry guidance. */
export const errorResponseSchema = modelMetadataSchema.extend({
  error: z.discriminatedUnion('code', [
    z
      .object({
        code: z.literal('RATE_LIMIT'),
        message: z.string(),
        retryAfterSeconds: z.number().int().min(1).max(3600).optional(),
      })
      .strict(),
    z
      .object({
        code: z.enum(['INVALID_INPUT', 'MODEL_FAILURE', 'TIMEOUT']),
        message: z.string(),
      })
      .strict(),
  ]),
});
/** Validates the shared chat/trace JSON error envelope without forwarding provider internals. */
export function buildErrorResponse(error: ChatError, metadata: ModelMetadata) {
  return errorResponseSchema.parse({
    ...metadata,
    error: {
      code: error.code,
      message: error.message,
      ...(error.code === 'RATE_LIMIT' && error.retryAfterSeconds !== undefined
        ? { retryAfterSeconds: error.retryAfterSeconds }
        : {}),
    },
  });
}
