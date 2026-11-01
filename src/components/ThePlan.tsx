import { PLAN_STEPS, PLAN_UI } from '@/content';
import { PlanCard } from './PlanCard';
import styles from './ThePlan.module.css';

export function ThePlan() {
  return (
    <section
      id="plan"
      className={styles.section}
      aria-labelledby="plan-heading"
    >
      <div className={styles.header}>
        <h2 id="plan-heading" className={styles.title}>
          {PLAN_UI.title}
        </h2>
        <p className={styles.subtitle}>{PLAN_UI.subtitle}</p>
      </div>
      <ol className={styles.grid}>
        {PLAN_STEPS.map((step) => (
          <PlanCard key={step.stepNumber} step={step} />
        ))}
      </ol>
    </section>
  );
}
