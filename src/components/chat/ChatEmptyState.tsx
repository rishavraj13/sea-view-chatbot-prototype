import { CHAT_COPY, STARTER_PROMPTS } from '@/content';
import styles from './ChatEmptyState.module.css';

interface ChatEmptyStateProps {
  readonly onSelectPrompt: (prompt: string) => void;
}

export function ChatEmptyState({ onSelectPrompt }: ChatEmptyStateProps) {
  return (
    <div className={styles.container}>
      <p className={styles.intro}>{CHAT_COPY.intro}</p>
      <div
        className={styles.chipsList}
        role="group"
        aria-label={CHAT_COPY.suggestions}
      >
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className={styles.chip}
            onClick={() => onSelectPrompt(prompt)}
          >
            <span>{prompt}</span>
            <span className={styles.chipArrow} aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
