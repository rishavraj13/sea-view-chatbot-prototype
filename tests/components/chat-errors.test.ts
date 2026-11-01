import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getErrorMessage, parseErrorResponse } from '@/components/chat/error-mapping';

interface MockErrorsCapture {
  evidence: string;
  captures: Array<{
    route: string;
    scenario: string;
    status: number;
    body: {
      mode: string;
      provider: string;
      modelId: string;
      error: {
        code: string;
        message: string;
        retryAfterSeconds?: number;
      };
    };
  }>;
}

describe('Error mapping and typed error handling', () => {
  const file = join(process.cwd(), 'docs', 'examples', 'rate-limit-diagnostics', 'mock-errors.json');
  const fixture: MockErrorsCapture = JSON.parse(readFileSync(file, 'utf8'));

  it('maps RATE_LIMIT error with retryAfterSeconds from real captured 429 fixture', () => {
    const capture = fixture.captures.find((c) => c.scenario === 'present' && c.route === 'chat')!;
    const parsed = parseErrorResponse(capture.body);

    expect(parsed.code).toBe('RATE_LIMIT');
    expect(parsed.retryAfterSeconds).toBe(12);
    expect(getErrorMessage(parsed)).toBe(
      'The model rate limit was reached. Please retry later.',
    );
  });

  it('maps RATE_LIMIT error without retryAfterSeconds from real captured 429 fixture', () => {
    const capture = fixture.captures.find((c) => c.scenario === 'absent' && c.route === 'chat')!;
    const parsed = parseErrorResponse(capture.body);

    expect(parsed.code).toBe('RATE_LIMIT');
    expect(parsed.retryAfterSeconds).toBeUndefined();
    expect(getErrorMessage(parsed)).toBe(
      'The model rate limit was reached. Please retry later.',
    );
  });

  it('maps TIMEOUT, MODEL_FAILURE and INVALID_INPUT codes to safe messages', () => {
    expect(getErrorMessage({ code: 'TIMEOUT', message: '' })).toBe(
      'The model timed out. Please retry.',
    );
    expect(getErrorMessage({ code: 'MODEL_FAILURE', message: '' })).toBe(
      'The model is temporarily unavailable.',
    );
    expect(getErrorMessage({ code: 'INVALID_INPUT', message: '' })).toBe(
      'Invalid request. Please check your message history.',
    );
  });
});
