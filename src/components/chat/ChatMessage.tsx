'use client';

import {
  MessagePrimitive,
  useAuiState,
  type ToolCallMessagePartProps,
  type TextMessagePartProps,
} from '@assistant-ui/react';
import { CHAT_COPY } from '@/content';
import { deduplicateSourcesByPage } from './source-utils';
import { toolOutputSchema } from './schemas';
import { ToolResultBrochure } from './ToolResultBrochure';
import { ToolResultVideo } from './ToolResultVideo';
import { ToolResultUnavailable } from './ToolResultUnavailable';
import styles from './ChatMessage.module.css';

export function MediaPart({
  result,
}: Pick<ToolCallMessagePartProps, 'result'>) {
  const parsed = toolOutputSchema.safeParse(result);
  if (!parsed.success) return null;
  const output = parsed.data;
  if (output.kind === 'brochure') return <ToolResultBrochure result={output} />;
  if (output.kind === 'video') return <ToolResultVideo result={output} />;
  return <ToolResultUnavailable />;
}
const text = ({ text }: TextMessagePartProps) => <span>{text}</span>;
const hiddenPart = () => null;
const textParts = {
  Text: text,
  Source: hiddenPart,
  Empty: hiddenPart,
  tools: { Fallback: hiddenPart },
};
const mediaParts = {
  Text: hiddenPart,
  Source: hiddenPart,
  Empty: hiddenPart,
  tools: {
    by_name: { sendBrochure: MediaPart, showVideo: MediaPart },
    Fallback: hiddenPart,
  },
};

export function ChatMessage() {
  const message = useAuiState((state) => state.message);
  const user = message.role === 'user';
  const chips = deduplicateSourcesByPage(
    message.parts.flatMap((part) =>
      part.type === 'source' && part.sourceType === 'url'
        ? [
            {
              type: 'source-url',
              sourceId: part.id,
              url: part.url,
              title: part.title,
            },
          ]
        : [],
    ),
  );
  return (
    <MessagePrimitive.Root asChild>
      <article
        data-role={message.role}
        className={`${styles.row} ${user ? styles.userRow : styles.assistantRow}`}
      >
        <div className={user ? styles.userBubble : styles.assistantText}>
          <MessagePrimitive.Parts components={textParts} />
        </div>
        {!user &&
          message.parts.some(
            (part) =>
              part.type === 'tool-call' &&
              toolOutputSchema.safeParse(part.result).success,
          ) && (
            <div className={styles.toolResultsArea}>
              <MessagePrimitive.Parts components={mediaParts} />
            </div>
          )}
        {chips.length > 0 && (
          <div className={styles.sourcesArea} aria-label={CHAT_COPY.sources}>
            {chips.map((chip) => (
              <a
                key={chip.pageKey}
                href={chip.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sourceChip}
              >
                {chip.label} ↗
              </a>
            ))}
          </div>
        )}
      </article>
    </MessagePrimitive.Root>
  );
}
