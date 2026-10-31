import { APICallError } from 'ai';
import { z } from 'zod';
import { readEnv } from '../config';
import type { ModelMetadata } from '../config';

const headerNames = new Set([
  'retry-after',
  'x-ratelimit-limit-requests',
  'x-ratelimit-limit-tokens',
  'x-ratelimit-remaining-requests',
  'x-ratelimit-remaining-tokens',
  'x-ratelimit-reset-requests',
  'x-ratelimit-reset-tokens',
]);
const providerFields = z.object({
  error: z.object({
    type: z.unknown().optional(),
    code: z.unknown().optional(),
  }),
});
/** Public model identity attached to a sanitized server-only error event. */
export type ProviderErrorContext = Pick<ModelMetadata, 'provider' | 'modelId'>;

function secrets(): string[] {
  try {
    const env = readEnv();
    return [
      env.GROQ_API_KEY,
      env.OPENROUTER_API_KEY,
      env.GOOGLE_GENERATIVE_AI_API_KEY,
    ].filter((value): value is string => Boolean(value));
  } catch {
    return [];
  }
}
function containsSecret(value: string): boolean {
  return (
    /(?:gsk_|AIza|sk-|Bearer\s)/i.test(value) ||
    secrets().some((key) => value.includes(key))
  );
}
function identifier(value: unknown): string | null {
  return typeof value === 'string' &&
    /^[A-Za-z0-9_.:-]{1,128}$/.test(value) &&
    !containsSecret(value)
    ? value
    : null;
}
/** Case-insensitive fixed header allowlist; only bounded quota numbers/durations or HTTP retry dates survive. */
export function quotaHeaders(headers: unknown): Record<string, string> {
  const parsed = z.record(z.string(), z.string()).safeParse(headers);
  if (!parsed.success) return {};
  const result: Record<string, string> = {};
  for (const [name, raw] of Object.entries(parsed.data)) {
    const key = name.toLowerCase(),
      value = raw.trim();
    if (!headerNames.has(key) || value.length > 100 || containsSecret(value))
      continue;
    const numeric = /^\d+$/.test(value);
    const duration = /^(?:\d+(?:\.\d+)?(?:ms|s|m|h|d))+$/.test(value);
    const date =
      key === 'retry-after' &&
      /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(
        value,
      ) &&
      Number.isFinite(Date.parse(value));
    if (numeric || (key.includes('-reset-') && duration) || date)
      result[key] = value;
  }
  return result;
}
/** Parses HTTP delta-seconds or a valid HTTP date; invalid/absent values are omitted, seconds clamp to 1..3600. */
export function retryAfterSeconds(
  headers: unknown,
  now = Date.now(),
): number | undefined {
  const value = quotaHeaders(headers)['retry-after'];
  if (!value) return undefined;
  const seconds = /^\d+$/.test(value)
    ? Number(value)
    : Math.ceil((Date.parse(value) - now) / 1000);
  return Number.isFinite(seconds)
    ? Math.max(1, Math.min(3600, seconds))
    : undefined;
}
/** Writes one allowlisted JSON event, never the exception, message, URL, body, stack or conversation. */
export function logProviderError(
  error: unknown,
  context: ProviderErrorContext,
): void {
  const api = APICallError.isInstance(error) ? error : null;
  const fields = providerFields.safeParse(api?.data);
  let bodyFields: z.infer<typeof providerFields> | undefined;
  if (api?.responseBody && api.responseBody.length <= 65536) {
    try {
      const parsed = providerFields.safeParse(JSON.parse(api.responseBody));
      if (parsed.success) bodyFields = parsed.data;
    } catch {
      /* Non-JSON bodies supply no safe provider labels. */
    }
  }
  const type = fields.success ? fields.data.error.type : undefined;
  const code = fields.success ? fields.data.error.code : undefined;
  const errorCode = code ?? bodyFields?.error.code;
  const fallback =
    error instanceof Error &&
    [
      'Error',
      'TimeoutError',
      'AbortError',
      'AI_APICallError',
      'AI_ToolChoiceViolationError',
    ].includes(error.name)
      ? error.name
      : null;
  console.error(
    JSON.stringify({
      event: 'provider_error',
      provider: context.provider,
      modelId:
        /^[A-Za-z0-9][A-Za-z0-9./:_-]{0,127}$/.test(context.modelId) &&
        !containsSecret(context.modelId)
          ? context.modelId
          : 'unconfigured',
      upstreamStatus:
        api?.statusCode &&
        Number.isInteger(api.statusCode) &&
        api.statusCode >= 100 &&
        api.statusCode <= 599
          ? api.statusCode
          : null,
      errorType: identifier(type ?? bodyFields?.error.type) ?? fallback,
      errorCode:
        typeof errorCode === 'number' && Number.isSafeInteger(errorCode)
          ? errorCode
          : identifier(errorCode),
      rateLimitHeaders: quotaHeaders(api?.responseHeaders),
    }),
  );
}
