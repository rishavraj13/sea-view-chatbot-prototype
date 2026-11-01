/** Public request bounds, verified against the frozen backend schema in tests. */
export const CHAT_LIMITS = {
  messages: 30,
  parts: 8,
  text: 4000,
  id: 128,
} as const;
