'use client';

import { useEffect, useState } from 'react';
import { CHAT_COPY } from '@/content';
import type { VideoResult } from './types';
import styles from './ToolResultVideo.module.css';

interface ToolResultVideoProps {
  readonly result: VideoResult;
}

export function ToolResultVideo({ result }: ToolResultVideoProps) {
  const [poster, setPoster] = useState<string | undefined>(result.posterUrl);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);

  // If posterUrl fails to load, drop the poster
  useEffect(() => {
    if (!result.posterUrl) return;
    const img = new Image();
    img.src = result.posterUrl;
    img.onerror = () => {
      setPoster(undefined);
    };
  }, [result.posterUrl]);

  return (
    <div className={styles.card} role="region" aria-label={CHAT_COPY.video}>
      <span className={styles.title}>{result.title}</span>
      <div className={styles.videoWrapper}>
        <video
          controls
          playsInline
          preload="none"
          poster={poster}
          className={styles.video}
          onError={() => setHasPlaybackError(true)}
          title={result.title}
        >
          <source src={result.url} type="video/mp4" />
          {CHAT_COPY.noVideo}
        </video>
      </div>

      {hasPlaybackError && (
        <div className={styles.fallbackContainer}>
          <span className={styles.fallbackText}>{CHAT_COPY.videoError}</span>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.fallbackLink}
          >
            {CHAT_COPY.watch}
          </a>
        </div>
      )}
    </div>
  );
}
