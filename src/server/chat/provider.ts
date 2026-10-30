import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { readEnv } from '../config';
/** Public mode only; invalid deployment configuration uses the safe fallback label. */
export function modelMode(): 'mock' | 'live' {
  try {
    return provider().mode;
  } catch {
    return 'mock';
  }
}
/** Creates a provider only with explicit, validated credentials; no SDK env fallback. */
export function provider() {
  const env = readEnv();
  return {
    mode:
      env.MODEL_MODE === 'mock' || !env.GOOGLE_GENERATIVE_AI_API_KEY
        ? ('mock' as const)
        : ('live' as const),
    model: () =>
      createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY })(
        env.GOOGLE_MODEL,
      ),
  };
}
