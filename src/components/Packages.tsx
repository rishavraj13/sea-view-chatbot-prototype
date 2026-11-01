'use client';

import {
  INCLUSIONS,
  PACKAGES,
  PACKAGE_UI,
  packageQuestion,
  SITE_METADATA,
} from '@/content';
import { useChatDialog } from './ChatContext';
import styles from './Packages.module.css';

export function Packages() {
  const { openChat } = useChatDialog();

  return (
    <section
      id="packages"
      className={styles.section}
      aria-labelledby="packages-heading"
    >
      <div className={styles.sectionHeader}>
        <h2 id="packages-heading" className={styles.sectionHeading}>
          {PACKAGE_UI.heading}
        </h2>
      </div>

      <div className={styles.grid}>
        {PACKAGES.map((pkg) => (
          <article key={pkg.id} className={styles.card}>
            <div className={styles.cardTop}>
              <h3 className={styles.packageName}>{pkg.name}</h3>
              <p className={styles.packageTagline}>{pkg.tagline}</p>
              <div className={styles.priceBlock}>
                <span className={styles.priceAmount}>{pkg.price}</span>
                <span className={styles.pricePerPerson}>
                  {PACKAGE_UI.perPerson}
                </span>
              </div>
            </div>
            <div className={styles.cardAction}>
              <button
                type="button"
                className={styles.askButton}
                onClick={() => openChat(packageQuestion(pkg.name))}
              >
                <span>{PACKAGE_UI.ask}</span>
                <span className="sr-only"> ({pkg.name})</span>
                <span aria-hidden="true"> →</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.inclusionsBlock}>
        <h3 className={styles.inclusionsTitle}>{PACKAGE_UI.inclusions}</h3>
        <ul className={styles.inclusionsList}>
          {INCLUSIONS.map((inclusion) => (
            <li key={inclusion} className={styles.inclusionItem}>
              <span className={styles.inclusionBullet} aria-hidden="true" />
              <span>{inclusion}</span>
            </li>
          ))}
        </ul>
        <div className={styles.inclusionsFooter}>
          <a
            href={SITE_METADATA.greedyAdventuresUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            {PACKAGE_UI.websiteLink}
          </a>
        </div>
      </div>
    </section>
  );
}
