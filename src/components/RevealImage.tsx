'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './RevealImage.module.css';

interface RevealImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
}

export function RevealImage({
  src,
  alt,
  width,
  height,
  className = '',
  style,
  sizes = '(max-width: 768px) 100vw, 1280px',
}: RevealImageProps) {
  const [revealed, setRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.wrapper} ${className}`}
      style={style}
    >
      <div
        className={`${styles.revealContainer} ${revealed ? styles.isRevealed : ''}`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={styles.imageInner}
        />
      </div>
    </div>
  );
}
