import type { UIMessage } from 'ai';
import { z } from 'zod';
import { CHAT_LIMITS } from './limits';
import { sourceSchema, toolOutputSchema } from './schemas';

const textPart = z.object({
  type: z.literal('text'),
  text: z.string().trim().min(1).max(CHAT_LIMITS.text),
});
const toolPart = z.object({
  type: z.enum(['tool-sendBrochure', 'tool-showVideo']),
  toolCallId: z.string().max(CHAT_LIMITS.id),
  state: z.literal('output-available'),
  input: z.object({ id: z.string().max(100) }),
  output: toolOutputSchema,
});
const stepPart = z.object({ type: z.literal('step-start') });
export const projectedBodySchema = z
  .object({
    messages: z
      .array(
        z.object({
          id: z.string().max(CHAT_LIMITS.id),
          role: z.enum(['user', 'assistant']),
          parts: z
            .array(z.union([textPart, sourceSchema, toolPart, stepPart]))
            .min(1)
            .max(CHAT_LIMITS.parts),
        }),
      )
      .min(1)
      .max(CHAT_LIMITS.messages),
  })
  .refine((body) => body.messages.at(-1)?.role === 'user');

/** Keeps every turn, coalesces/bounds text, and retains two citations/tools plus one step marker. */
export function projectRequest(messages: readonly UIMessage[]) {
  return projectedBodySchema.parse({
    messages: messages.map((message) => {
      const text = message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('\n')
        .trim()
        .slice(0, CHAT_LIMITS.text);
      const sources = new Map<string, z.infer<typeof sourceSchema>>();
      const tools = new Map<string, z.infer<typeof toolPart>>();
      for (const part of message.parts) {
        const source = sourceSchema.safeParse(part);
        if (source.success) sources.set(source.data.url, source.data);
        const tool = toolPart.safeParse(part);
        if (tool.success) tools.set(tool.data.type, tool.data);
      }
      return {
        id: message.id,
        role: message.role,
        parts: [
          ...(message.parts.some((part) => part.type === 'step-start')
            ? [{ type: 'step-start' as const }]
            : []),
          ...(text ? [{ type: 'text' as const, text }] : []),
          ...[...sources.values()].slice(0, 2),
          ...tools.values(),
        ],
      };
    }),
  });
}
