import { FAQS, FAQ_UI } from '@/content';
import styles from './Faq.module.css';

export function Faq() {
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-heading">
      <div className={styles.header}>
        <h2 id="faq-heading" className={styles.title}>
          {FAQ_UI.title}
        </h2>
        <p className={styles.subtitle}>{FAQ_UI.subtitle}</p>
      </div>

      <div className={styles.accordion}>
        {FAQS.map((item) => (
          <details key={item.id} className={styles.item}>
            <summary className={styles.summary}>
              <span>{item.question}</span>
              <span className={styles.icon} aria-hidden="true">
                +
              </span>
            </summary>
            <div className={styles.content}>
              <p>{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
