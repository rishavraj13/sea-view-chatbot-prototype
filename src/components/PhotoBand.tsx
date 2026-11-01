import { HERO_IMAGE } from '@/content';
import { RevealImage } from './RevealImage';
import styles from './PhotoBand.module.css';

export function PhotoBand() {
  return (
    <div className={styles.band} aria-hidden="true">
      <div className={styles.imageContainer}>
        <RevealImage
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          width={HERO_IMAGE.width}
          height={HERO_IMAGE.height}
          priority
          sizes="(max-width: 768px) 100vw, 1280px"
        />
      </div>
    </div>
  );
}
