import styles from './ToolResultUnavailable.module.css';

export function ToolResultUnavailable() {
  return (
    <p className={styles.note} role="note">
      That file isn&apos;t available right now.
    </p>
  );
}

