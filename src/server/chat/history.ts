import type { ChatRequest } from './validation';

/** Projects validated UI history to text-only model messages; structural parts are never prompt content. */
export function buildModelMessages(
  messages: Readonly<ChatRequest['messages']>,
) {
  return messages
    .map((message) => ({
      role: message.role,
      content: message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('\n'),
    }))
    .filter((message) => message.content.trim().length > 0);
}
