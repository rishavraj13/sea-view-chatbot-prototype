import { STARTER_PROMPTS } from '@/content';
import styles from './ChatEmptyState.module.css';

interface ChatEmptyStateProps {
  readonly onSelectPrompt: (prompt: string) => void;
}

export function ChatEmptyState({ onSelectPrompt }: ChatEmptyStateProps) {
  return (
    <div className={styles.container}>
      <p className={styles.intro}>
        Ask questions about jump packages, weather cancellations, or request media.
      </p>
      <div className={styles.chipsList} role="group" aria-label="Suggested starter questions">
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
