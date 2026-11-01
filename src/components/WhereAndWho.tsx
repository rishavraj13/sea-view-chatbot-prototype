import { LOCATION_INFO } from '@/content';
import styles from './WhereAndWho.module.css';

export function WhereAndWho() {
  return (
    <section className={styles.section} aria-labelledby="location-heading">
      <div className={styles.grid}>
        <div className={styles.column}>
          <span className={styles.label}>{LOCATION_INFO.title}</span>
          <p id="location-heading" className={styles.primaryText}>
            {LOCATION_INFO.spot}
          </p>
          <p className={styles.secondaryText}>{LOCATION_INFO.address}</p>
        </div>
        <div className={styles.column}>
          <span className={styles.label}>{LOCATION_INFO.operatorTitle}</span>
          <p className={styles.primaryText}>{LOCATION_INFO.operator}</p>
        </div>
      </div>
    </section>
  );
}
