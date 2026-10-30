import { APICallError } from 'ai';
/** Stable public error contract. */
export class ChatError extends Error {
  constructor(
    public code: 'INVALID_INPUT' | 'MODEL_FAILURE' | 'TIMEOUT' | 'RATE_LIMIT',
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
/** Sanitizes all provider exceptions. */
export function mapError(error: unknown): ChatError {
  if (error instanceof ChatError) return error;
  if (
    error instanceof Error &&
    ['TimeoutError', 'AbortError'].includes(error.name)
  )
    return new ChatError('TIMEOUT', 504, 'The model timed out. Please retry.');
  if (APICallError.isInstance(error) && error.statusCode === 429)
    return new ChatError(
      'RATE_LIMIT',
      429,
      'The model rate limit was reached. Please retry later.',
    );
  return new ChatError(
    'MODEL_FAILURE',
    502,
    'The model is temporarily unavailable.',
  );
}
