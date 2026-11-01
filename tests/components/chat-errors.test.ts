import { APICallError } from 'ai';
import { describe, expect, it } from 'vitest';
import { ERROR_MESSAGES } from '@/content';
import { errorCopy, parseChatError } from '@/components/chat/api-error';

const apiError = (body: unknown) =>
  new APICallError({
    message: 'Never display this',
    url: '/api/chat',
    requestBodyValues: {},
    statusCode: 429,
    responseBody: typeof body === 'string' ? body : JSON.stringify(body),
  });
describe('Public chat errors', () => {
  it.each(['RATE_LIMIT', 'TIMEOUT', 'MODEL_FAILURE', 'INVALID_INPUT'] as const)(
    'validates %s and uses only product copy',
    (code) => {
      const parsed = parseChatError(
        apiError({
          error: { code, message: 'untrusted backend copy' },
          mode: 'mock',
        }),
      );
      expect(parsed).toEqual({ code, mode: 'mock' });
      expect(errorCopy(parsed)).toBe(ERROR_MESSAGES[code]);
      expect(errorCopy(parsed)).not.toContain('untrusted');
    },
  );
  it('preserves a valid retry delay and omits absent delays', () => {
    expect(
      parseChatError(
        apiError({
          error: { code: 'RATE_LIMIT', message: 'raw', retryAfterSeconds: 12 },
        }),
      ).retryAfterSeconds,
    ).toBe(12);
    expect(
      parseChatError(
        apiError({ error: { code: 'RATE_LIMIT', message: 'raw' } }),
      ).retryAfterSeconds,
    ).toBeUndefined();
  });
  it.each(['garbage', 0, -1, 3601, 1.5, null])(
    'rejects invalid retry delay %s',
    (retryAfterSeconds) => {
      expect(
        parseChatError(
          apiError({
            error: { code: 'RATE_LIMIT', message: 'raw', retryAfterSeconds },
          }),
        ),
      ).toEqual({ code: 'UNKNOWN' });
    },
  );
  it.each([
    apiError('not JSON'),
    new DOMException('aborted', 'AbortError'),
    new TypeError('network'),
    new Error('raw'),
    apiError({ error: { code: 'BOGUS', message: 'raw' } }),
  ])('maps unparseable failures to unknown', (error) => {
    expect(parseChatError(error)).toEqual({ code: 'UNKNOWN' });
    expect(errorCopy(parseChatError(error))).toBe(ERROR_MESSAGES.UNKNOWN);
  });
});
