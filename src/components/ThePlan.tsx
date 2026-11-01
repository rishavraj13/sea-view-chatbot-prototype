import { PLAN_STEPS } from '@/content';
import { RevealImage } from './RevealImage';
import styles from './ThePlan.module.css';

export function ThePlan() {
  const step1 = PLAN_STEPS[0]!;
  const step2 = PLAN_STEPS[1]!;
  const step3 = PLAN_STEPS[2]!;
  const step4 = PLAN_STEPS[3]!;
  const step5 = PLAN_STEPS[4]!;

  return (
    <section id="plan" className={styles.section} aria-labelledby="plan-heading">
      <div className={styles.header}>
        <h2 id="plan-heading" className={styles.title}>
          The plan
        </h2>
        <p className={styles.subtitle}>Five steps, from check-in to landing</p>
      </div>

      <div className={styles.step1Notice}>
        <span className={styles.step1Tag}>Step 1 · {step1.title}</span>
        <span className={styles.step1Text}>{step1.description}</span>
      </div>

      <div className={styles.grid}>
        {/* Step 4: 8 cols wide rectangle */}
        <div className={`${styles.stepWrapper} ${styles.step4Col}`}>
          <div className={styles.step4Image}>
            <RevealImage
              src={step4.image!.src}
              alt={step4.image!.alt}
              width={step4.image!.width}
              height={step4.image!.height}
              sizes="(max-width: 900px) 100vw, 66vw"
            />
          </div>
          <span className={styles.stepNumber}>Step 4</span>
          <h3 className={styles.stepCaption}>{step4.title}</h3>
          <p className={styles.stepDesc}>{step4.description}</p>
        </div>

        {/* Step 3: 4 cols vertical pill (500px, radius 9999px) */}
        <div className={`${styles.stepWrapper} ${styles.step3Col}`}>
          <div className={styles.step3Pill}>
            <RevealImage
              src={step3.image!.src}
              alt={step3.image!.alt}
              width={step3.image!.width}
              height={step3.image!.height}
              sizes="(max-width: 900px) 100vw, 33vw"
            />
          </div>
          <span className={styles.stepNumber}>Step 3</span>
          <h3 className={styles.stepCaption}>{step3.title}</h3>
          <p className={styles.stepDesc}>{step3.description}</p>
        </div>

        {/* Step 5: Circle (aspect-square) */}
        <div className={`${styles.stepWrapper} ${styles.step5Col}`}>
          <div className={styles.step5Circle}>
            <RevealImage
              src={step5.image!.src}
              alt={step5.image!.alt}
              width={step5.image!.width}
              height={step5.image!.height}
              sizes="(max-width: 900px) 60vw, 40vw"
            />
          </div>
          <span className={styles.stepNumber}>Step 5</span>
          <h3 className={styles.stepCaption}>{step5.title}</h3>
          <p className={styles.stepDesc}>{step5.description}</p>
        </div>

        {/* Step 2: 7 cols wide rectangle */}
        <div className={`${styles.stepWrapper} ${styles.step2Col}`}>
          <div className={styles.step2Image}>
            <RevealImage
              src={step2.image!.src}
              alt={step2.image!.alt}
              width={step2.image!.width}
              height={step2.image!.height}
              sizes="(max-width: 900px) 100vw, 58vw"
            />
          </div>
          <span className={styles.stepNumber}>Step 2</span>
          <h3 className={styles.stepCaption}>{step2.title}</h3>
          <p className={styles.stepDesc}>{step2.description}</p>
        </div>
      </div>
    </section>
  );
}
