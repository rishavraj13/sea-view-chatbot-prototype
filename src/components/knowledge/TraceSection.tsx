import type { ReactNode } from 'react';
import styles from './TraceResults.module.css';

export function TraceSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={styles.stepBlock}>
      <h3 id={id} className={styles.stepHeader}>
        {title}
      </h3>
      {children}
    </section>
  );
}
