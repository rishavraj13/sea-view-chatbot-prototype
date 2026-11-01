import type { UIMessage } from 'ai';
import { responseMetadataSchema } from './schemas';
import type { ProductError } from './api-error';

/** Latest response wins; an empty/new thread has no mode. */
export function responseMode(
  messages: readonly UIMessage[],
  error?: ProductError,
): 'mock' | 'live' | undefined {
  if (error?.mode !== undefined) return error.mode;
  const latest = messages.findLast((message) => message.role === 'assistant');
  const parsed = responseMetadataSchema.safeParse(latest?.metadata);
  return parsed.success ? parsed.data.mode : undefined;
}
