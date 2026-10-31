import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { APICallError } from 'ai';
import {
  mapError,
  ChatError,
  errorResponseSchema,
} from '../../../src/server/chat';
import {
  quotaHeaders,
  retryAfterSeconds,
} from '../../../src/server/chat/provider-error';
import { POST as chat } from '../../../src/app/api/chat/route';
import { POST as trace } from '../../../src/app/api/knowledge/trace/route';
const context = { provider: 'groq' as const, modelId: 'qwen/qwen3.8-27b' };
beforeEach(() => {
  vi.stubEnv('MODEL_MODE', 'live');
  vi.stubEnv('MODEL_PROVIDER', 'groq');
  vi.stubEnv('MODEL_ID', context.modelId);
  vi.stubEnv('GROQ_API_KEY', 'MOCK_private_key_never_log');
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it.each([
  [429, 'RATE_LIMIT'],
  [400, 'MODEL_FAILURE'],
  [401, 'MODEL_FAILURE'],
  [403, 'MODEL_FAILURE'],
  [408, 'MODEL_FAILURE'],
  [500, 'MODEL_FAILURE'],
  [503, 'MODEL_FAILURE'],
  [504, 'MODEL_FAILURE'],
  [undefined, 'MODEL_FAILURE'],
])(
  'MOCK SDK HTTP %s maps to %s independent of provider type/code',
  (status, expected) => {
    const error = new APICallError({
      message: 'private message',
      url: 'https://mock.invalid',
      requestBodyValues: {},
      statusCode: status,
      data: {
        error: { type: 'rate_limit_error', code: 'rate_limit_exceeded' },
      },
    });
    expect(mapError(error, context).code).toBe(expected);
    expect(console.error).toHaveBeenCalledTimes(1);
  },
);
it('plain status/code objects are not treated as SDK rate limits; mapped errors do not log twice', () => {
  expect(mapError({ status: 429, code: 'rate_limit_exceeded' }).code).toBe(
    'MODEL_FAILURE',
  );
  expect(console.error).not.toHaveBeenCalled();
  const mapped = mapError(
    new APICallError({
      message: 'private',
      url: 'https://mock.invalid',
      requestBodyValues: {},
      statusCode: 429,
    }),
    context,
  );
  expect(mapError(mapped)).toBe(mapped);
  expect(console.error).toHaveBeenCalledTimes(1);
  expect(
    mapError(new ChatError('INVALID_INPUT', 400, 'Invalid JSON.')).code,
  ).toBe('INVALID_INPUT');
  expect(console.error).toHaveBeenCalledTimes(1);
});
it.each([
  ['120', 120],
  ['0', 1],
  ['99999', 3600],
  [' 3 ', 3],
  [undefined, undefined],
  ['garbage', undefined],
  ['-1', undefined],
  ['1.5', undefined],
  ['', undefined],
])('retry-after %s is validated, clamped or omitted', (value, expected) => {
  expect(
    retryAfterSeconds(value === undefined ? {} : { 'Retry-After': value }),
  ).toBe(expected);
});
it('HTTP-date retry guidance is relative to server time, rounded up and clamped', () => {
  const now = Date.parse('2026-10-31T12:00:00Z');
  expect(
    retryAfterSeconds(
      { 'retry-after': 'Sat, 31 Oct 2026 12:00:02 GMT' },
      now + 500,
    ),
  ).toBe(2);
  expect(
    retryAfterSeconds({ 'retry-after': 'Sat, 31 Oct 2026 11:00:00 GMT' }, now),
  ).toBe(1);
  expect(
    retryAfterSeconds({ 'retry-after': 'Sat, 31 Oct 2026 15:00:00 GMT' }, now),
  ).toBe(3600);
});
it('one log contains only selected identity, safe upstream labels/status and allowlisted quota values', () => {
  const secret = 'MOCK_private_key_never_log';
  const error = new APICallError({
    message: `NEVER_LOG_MESSAGE ${secret}`,
    url: `https://mock.invalid/${secret}`,
    requestBodyValues: { conversation: 'NEVER_LOG_CONVERSATION', key: secret },
    statusCode: 429,
    data: { error: { type: 'rate_limit_error', message: 'NEVER_LOG_MESSAGE' } },
    responseBody: JSON.stringify({
      error: {
        type: 'rate_limit_error',
        code: 'tokens',
        message: `NEVER_LOG_CONVERSATION ${secret}`,
      },
    }),
    responseHeaders: {
      Authorization: `Bearer ${secret}`,
      'set-cookie': secret,
      'Retry-After': '15',
      'X-RateLimit-Limit-Tokens': '8000',
      'x-ratelimit-remaining-tokens': '0',
      'x-ratelimit-reset-tokens': '1m26.4s',
      'x-ratelimit-api-key': secret,
      'x-ratelimit-reset-requests': secret,
    },
  });
  const mapped = mapError(error, context);
  mapError(mapped);
  expect(console.error).toHaveBeenCalledTimes(1);
  const log = vi.mocked(console.error).mock.calls[0]!;
  expect(log).toHaveLength(1);
  expect(JSON.parse(log[0])).toEqual({
    event: 'provider_error',
    ...context,
    upstreamStatus: 429,
    errorType: 'rate_limit_error',
    errorCode: 'tokens',
    rateLimitHeaders: {
      'retry-after': '15',
      'x-ratelimit-limit-tokens': '8000',
      'x-ratelimit-remaining-tokens': '0',
      'x-ratelimit-reset-tokens': '1m26.4s',
    },
  });
  expect(log[0]).not.toMatch(
    /MOCK_private|NEVER_LOG|Authorization|conversation|stack|responseBody/,
  );
});
it('provider labels that contain configured keys or free-form text never reach logs', () => {
  mapError(
    new APICallError({
      message: 'private',
      url: 'https://mock.invalid',
      requestBodyValues: {},
      statusCode: 500,
      data: {
        error: {
          type: 'MOCK_private_key_never_log',
          code: 'a private conversation',
        },
      },
    }),
    context,
  );
  const log = String(vi.mocked(console.error).mock.calls[0]![0]);
  expect(log).not.toContain('MOCK_private_key_never_log');
  expect(log).not.toContain('a private conversation');
  expect(
    quotaHeaders({
      'x-ratelimit-reset-tokens': 'gsk_FAKE_KEY',
      'x-ratelimit-unknown': '123',
    }),
  ).toEqual({});
});
it.each([
  ['present', '12', 12],
  ['absent', undefined, undefined],
  ['garbage', 'garbage', undefined],
  ['clamped', '5000', 3600],
] as const)(
  'MOCK actual chat/trace HTTP error contract: retry-after %s',
  async (_name, header, expected) => {
    const fetch = vi.fn(async () =>
      Response.json(
        {
          error: {
            message: 'MOCK_private_key_never_log NEVER_LOG_CONVERSATION',
            type: 'rate_limit_error',
            code: 'tokens',
          },
        },
        {
          status: 429,
          headers: header === undefined ? {} : { 'retry-after': header },
        },
      ),
    );
    vi.stubGlobal('fetch', fetch);
    for (const [handler, body] of [
      [
        chat,
        {
          messages: [
            {
              id: 'MOCK',
              role: 'user',
              parts: [{ type: 'text', text: 'NEVER_LOG_CONVERSATION' }],
            },
          ],
        },
      ],
      [trace, { question: 'NEVER_LOG_CONVERSATION' }],
    ] as const) {
      const before = vi.mocked(console.error).mock.calls.length;
      const response = await handler(
        new Request('https://mock.invalid/api', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      );
      expect(response.status).toBe(429);
      const wire = await response.text();
      const parsed = errorResponseSchema.parse(JSON.parse(wire));
      expect(parsed).toMatchObject({
        mode: 'live',
        ...context,
        error: { code: 'RATE_LIMIT' },
      });
      expect(
        parsed.error.code === 'RATE_LIMIT'
          ? parsed.error.retryAfterSeconds
          : undefined,
      ).toBe(expected);
      if (expected === undefined)
        expect(parsed.error).not.toHaveProperty('retryAfterSeconds');
      expect(wire).not.toMatch(
        /MOCK_private|NEVER_LOG|tokens|rate_limit_error/,
      );
      expect(vi.mocked(console.error).mock.calls.length - before).toBe(1);
    }
    expect(fetch).toHaveBeenCalledTimes(2);
  },
);
it.each([0, 3601, -1, 1.5, '12'])(
  'public response schema rejects invalid retryAfterSeconds %s',
  (value) => {
    expect(
      errorResponseSchema.safeParse({
        mode: 'live',
        ...context,
        error: {
          code: 'RATE_LIMIT',
          message: 'safe',
          retryAfterSeconds: value,
        },
      }).success,
    ).toBe(false);
  },
);
it('non-rate errors cannot carry retry guidance and invalid input emits no provider log', async () => {
  expect(
    errorResponseSchema.safeParse({
      mode: 'live',
      ...context,
      error: { code: 'MODEL_FAILURE', message: 'safe', retryAfterSeconds: 1 },
    }).success,
  ).toBe(false);
  await chat(
    new Request('https://mock.invalid/api/chat', {
      method: 'POST',
      body: '{}',
    }),
  );
  expect(console.error).not.toHaveBeenCalled();
});
