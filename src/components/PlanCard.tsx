'use client';

import { stepLabel, type PlanStep } from '@/content';
import { RevealImage } from './RevealImage';
import { useScrollProgress } from './scroll/useScrollProgress';
import styles from './ThePlan.module.css';
import { planImageSizes } from './plan-image-sizes';

export function PlanCard({ step }: { readonly step: PlanStep }) {
  const ref = useScrollProgress<HTMLLIElement>('passage');
  return (
    <li ref={ref} className={styles.card} data-plan-card={step.stepNumber}>
      <div className={styles.drift} data-plan-drift>
        <div className={styles.surface} data-plan-surface>
          <p className={styles.label}>{stepLabel(step.stepNumber)}</p>
          <span className={styles.numeral} aria-hidden="true">
            {String(step.stepNumber).padStart(2, '0')}
          </span>
          <h3 className={styles.stepTitle}>{step.title}</h3>
          <p className={styles.caption}>{step.description}</p>
          {step.image && (
            <div className={styles.photo} data-plan-photo>
              <RevealImage
                {...step.image}
                sizes={planImageSizes(step.stepNumber)}
              />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
