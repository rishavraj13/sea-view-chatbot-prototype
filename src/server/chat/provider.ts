import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { generateText } from 'ai';
import { readEnv, modelMetadataSchema } from '../config';
import type { ModelMetadata } from '../config';
/** Safe public response metadata; invalid configuration never exposes parsed environment values. */
export function publicModelMetadata(): ModelMetadata {
  try {
    const { mode, provider: selected, modelId } = provider();
    return { mode, provider: selected, modelId };
  } catch {
    return { mode: 'mock', provider: 'google', modelId: 'unconfigured' };
  }
}
/** Public mode only; invalid configuration retains the existing safe mode label. */
export function modelMode(): 'mock' | 'live' {
  try {
    return provider().mode;
  } catch {
    return 'mock';
  }
}
/** Creates only the selected provider using explicit credentials and model-specific reasoning controls. */
export function provider() {
  const env = readEnv();
  const selected = env.MODEL_PROVIDER;
  const modelId =
    env.MODEL_ID ??
    {
      google: env.GOOGLE_MODEL,
      groq: 'llama-3.3-70b-versatile',
      openrouter: 'nvidia/nemotron-3.5-lightning:free',
    }[selected];
  const key = {
    google: env.GOOGLE_GENERATIVE_AI_API_KEY,
    groq: env.GROQ_API_KEY,
    openrouter: env.OPENROUTER_API_KEY,
  }[selected];
  const metadata = modelMetadataSchema.parse({
    mode: env.MODEL_MODE === 'mock' || !key ? 'mock' : 'live',
    provider: selected,
    modelId,
  });
  const providerOptions: NonNullable<
    Parameters<typeof generateText>[0]['providerOptions']
  > = {};
  if (
    selected === 'google' &&
    ['gemini-2.5-flash', 'gemini-2.5-flash-lite'].includes(modelId)
  )
    providerOptions.google = {
      thinkingConfig: {
        thinkingBudget: env.GOOGLE_THINKING_BUDGET,
        includeThoughts: false,
      },
    };
  if (selected === 'google' && modelId === 'gemini-2.5-pro')
    providerOptions.google = {
      thinkingConfig: {
        thinkingBudget: Math.max(128, env.GOOGLE_THINKING_BUDGET),
        includeThoughts: false,
      },
    };
  if (selected === 'google' && /^gemini-[34]/.test(modelId))
    providerOptions.google = {
      thinkingConfig: {
        thinkingLevel: env.GOOGLE_THINKING_LEVEL,
        includeThoughts: false,
      },
    };
  if (
    selected === 'groq' &&
    ['openai/gpt-oss-20b', 'openai/gpt-oss-120b'].includes(modelId)
  )
    providerOptions.groq = {
      reasoningEffort:
        env.REASONING_EFFORT === 'none' ? 'low' : env.REASONING_EFFORT,
    };
  if (selected === 'groq' && modelId === 'qwen/qwen3.8-27b')
    providerOptions.groq = { reasoningEffort: env.REASONING_EFFORT };
  return {
    ...metadata,
    providerOptions,
    model: () => {
      if (!key) throw Error('Selected provider key is missing');
      if (selected === 'google')
        return createGoogleGenerativeAI({ apiKey: key })(modelId);
      if (selected === 'groq') return createGroq({ apiKey: key })(modelId);
      return createOpenRouter({ apiKey: key }).chat(modelId, {
        provider: { allow_fallbacks: false, require_parameters: true },
        reasoning: {
          effort: env.REASONING_EFFORT,
          enabled: env.REASONING_EFFORT !== 'none',
        },
      });
    },
  };
}
