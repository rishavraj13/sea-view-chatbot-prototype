import { vi } from 'vitest';

vi.mock('next/font/local', () => ({
  default: () => ({
    className: 'mock-font',
    variable: '--mock-font',
    style: { fontFamily: 'mock' },
  }),
}));

vi.stubEnv('MODEL_MODE', 'mock');
vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', '');
vi.stubEnv('MODEL_PROVIDER', 'google');
vi.stubEnv('MODEL_ID', '');
vi.stubEnv('GROQ_API_KEY', '');
vi.stubEnv('OPENROUTER_API_KEY', '');
vi.stubEnv('GOOGLE_THINKING_BUDGET', '0');
vi.stubEnv('REASONING_EFFORT', 'low');
