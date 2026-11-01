import type { ChatErrorData, ErrorCode } from './types';

const DEFAULT_MESSAGES: Record<ErrorCode, string> = {
  RATE_LIMIT: 'The model rate limit was reached. Please retry later.',
  TIMEOUT: 'The model timed out. Please retry.',
  MODEL_FAILURE: 'The model is temporarily unavailable.',
  INVALID_INPUT: 'Invalid request. Please check your message history.',
};

export function getErrorMessage(error: ChatErrorData): string {
  if (error.message) {
    return error.message;
  }
  const code = error.code as ErrorCode;
  return DEFAULT_MESSAGES[code] ?? 'An unexpected error occurred. Please retry.';
}

export function parseErrorResponse(data: unknown): ChatErrorData {
  if (typeof data === 'object' && data !== null && 'error' in data) {
    const raw = (data as { error: unknown }).error;
    if (typeof raw === 'object' && raw !== null) {
      const e = raw as { code?: string; message?: string; retryAfterSeconds?: number };
      return {
        code: e.code ?? 'MODEL_FAILURE',
        message: e.message ?? 'The model is temporarily unavailable.',
        retryAfterSeconds: typeof e.retryAfterSeconds === 'number' ? e.retryAfterSeconds : undefined,
      };
    }
  }
  return {
    code: 'MODEL_FAILURE',
    message: 'The model is temporarily unavailable.',
  };
}

