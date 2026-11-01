export const STATEMENT_UI = {
  label: 'Experience overview',
  emphasis: 'Same',
  heading: 'Same aircraft, altitude and instructors in every package',
} as const;

export const PACKAGE_UI = {
  heading: 'Packages',
  perPerson: 'per person',
  ask: 'Ask about this package',
  inclusions: 'Included in every package:',
  websiteLink: 'View on greedyadventures.com ↗',
} as const;

export function packageAskLabel(name: string): string {
  return `${PACKAGE_UI.ask} (${name})`;
}

export function packageQuestion(name: string): string {
  return `Tell me about the ${name} package.`;
}

export const ERROR_MESSAGES = {
  RATE_LIMIT: 'The assistant is busy right now. Please try again shortly.',
  TIMEOUT: 'The reply took too long. Please try again.',
  MODEL_FAILURE: 'The assistant is temporarily unavailable. Please try again.',
  INVALID_INPUT: 'Please check your message and try again.',
  UNKNOWN: 'Something went wrong. Please try again.',
} as const;

export const TRACE_UI = {
  question: 'Question to test',
  earlierTurns: 'Optional earlier turns (conversation history)',
  priorUser: 'Prior user turn text',
  priorAssistant: 'Prior assistant turn text',
  output: 'Output from the real pipeline',
  context: 'Model Context',
  chunks: 'Retrieved Chunks',
  sources: 'Attributed Sources',
  tools: 'Tool Calls',
  media: 'Generated Media',
  answer: 'Final Answer',
  mode: 'Mode',
  provider: 'Provider',
  model: 'Model',
} as const;
