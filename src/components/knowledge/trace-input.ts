import { z } from 'zod';
import { CHAT_LIMITS } from '../chat/limits';
import { KNOWLEDGE_COPY } from '@/content';

export const traceFormSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(1, KNOWLEDGE_COPY.questionValidation)
      .max(CHAT_LIMITS.text),
    earlierUser: z.string().trim().max(CHAT_LIMITS.text),
    earlierAssistant: z.string().trim().max(CHAT_LIMITS.text),
  })
  .refine(
    (form) => Boolean(form.earlierUser) === Boolean(form.earlierAssistant),
    {
      path: ['earlierUser'],
      message: KNOWLEDGE_COPY.historyValidation,
    },
  );
export type TraceFormValues = z.infer<typeof traceFormSchema>;

/** Earlier turns are sent only as a complete pair, followed by the authoritative latest user turn. */
export function buildTraceRequest(form: TraceFormValues) {
  const value = traceFormSchema.parse(form);
  return {
    question: value.question,
    ...(value.earlierUser
      ? {
          messages: [
            {
              id: 'earlier-user',
              role: 'user' as const,
              parts: [{ type: 'text' as const, text: value.earlierUser }],
            },
            {
              id: 'earlier-assistant',
              role: 'assistant' as const,
              parts: [{ type: 'text' as const, text: value.earlierAssistant }],
            },
            {
              id: 'latest-user',
              role: 'user' as const,
              parts: [{ type: 'text' as const, text: value.question }],
            },
          ],
        }
      : {}),
  };
}
