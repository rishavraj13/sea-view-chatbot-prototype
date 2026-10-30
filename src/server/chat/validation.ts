import { z } from 'zod';
import { mediaResultSchema } from '../media';
const partSchema = z.union([
  z.object({
    type: z.literal('text'),
    text: z.string().trim().min(1).max(4000),
  }),
  z.object({ type: z.literal('step-start') }),
  z.object({
    type: z.enum(['tool-sendBrochure', 'tool-showVideo']),
    toolCallId: z.string().max(128),
    state: z.literal('output-available'),
    input: z.object({ id: z.string().max(100) }),
    output: mediaResultSchema,
  }),
]);
/** Bounded AI SDK history, including completed server tool results. */
export const chatRequestSchema = z
  .object({
    messages: z
      .array(
        z.object({
          id: z.string().max(128),
          role: z.enum(['user', 'assistant']),
          parts: z.array(partSchema).min(1).max(8),
        }),
      )
      .min(1)
      .max(30),
  })
  .refine(
    (v) => v.messages.at(-1)?.role === 'user',
    'Last message must be user',
  );
/** Bounded trace request. */
export const traceRequestSchema = z
  .object({
    question: z.string().trim().min(1).max(4000),
    messages: chatRequestSchema.shape.messages.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.messages) {
      const result = chatRequestSchema.safeParse({ messages: value.messages });
      if (!result.success)
        ctx.addIssue({ code: 'custom', message: 'Invalid message history' });
    }
  });
/** Parsed history contract. */
export type ChatRequest = z.infer<typeof chatRequestSchema>;
