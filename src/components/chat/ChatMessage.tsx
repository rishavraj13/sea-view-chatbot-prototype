import type { UIMessage } from 'ai';
import { deduplicateSourcesByPage } from './source-utils';
import { ToolResultBrochure } from './ToolResultBrochure';
import { ToolResultVideo } from './ToolResultVideo';
import { ToolResultUnavailable } from './ToolResultUnavailable';
import type { BrochureResult, SourceCitation, VideoResult } from './types';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  readonly message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    const text = message.parts
      .filter((p) => p.type === 'text')
      .map((p) => ('text' in p ? p.text : ''))
      .join('\n');

    return (
      <div className={`${styles.row} ${styles.userRow}`}>
        <div className={styles.userBubble}>{text}</div>
      </div>
    );
  }

  // Assistant message
  const textParts: string[] = [];
  const brochureResults: BrochureResult[] = [];
  const videoResults: VideoResult[] = [];
  let hasUnavailable = false;
  const sourceCitations: SourceCitation[] = [];

  for (const part of message.parts) {
    if (part.type === 'text' && 'text' in part) {
      textParts.push(part.text);
    } else if (part.type === 'source-url') {
      sourceCitations.push(part as unknown as SourceCitation);
    } else if (
      part.type === 'tool-sendBrochure' ||
      part.type === 'tool-showVideo' ||
      part.type === 'tool-output-available' ||
      part.type === 'tool-invocation'
    ) {
      const output = 'output' in part ? (part.output as { kind?: string }) : undefined;
      if (output?.kind === 'brochure') {
        brochureResults.push(part.output as BrochureResult);
      } else if (output?.kind === 'video') {
        videoResults.push(part.output as VideoResult);
      } else if (output?.kind === 'unavailable') {
        hasUnavailable = true;
      }
    }
  }

  const chips = deduplicateSourcesByPage(sourceCitations);

  return (
    <div className={`${styles.row} ${styles.assistantRow}`}>
      {textParts.length > 0 && (
        <div className={styles.assistantText}>{textParts.join('\n')}</div>
      )}

      {(brochureResults.length > 0 || videoResults.length > 0 || hasUnavailable) && (
        <div className={styles.toolResultsArea}>
          {brochureResults.map((brochure) => (
            <ToolResultBrochure key={brochure.id} result={brochure} />
          ))}
          {videoResults.map((video) => (
            <ToolResultVideo key={video.id} result={video} />
          ))}
          {hasUnavailable && <ToolResultUnavailable />}
        </div>
      )}

      {chips.length > 0 && (
        <div className={styles.sourcesArea} aria-label="Referenced sources">
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
    </div>
  );
}
