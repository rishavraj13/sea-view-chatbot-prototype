'use client';

import { useEffect, useRef } from 'react';
import { passageProgress, scrollProgress } from './progress';

/** Position-driven CSS state; reduced motion owns its static value entirely in CSS. */
export function useScrollProgress<T extends HTMLElement>(
  mode: 'pin' | 'passage',
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const inset =
        mode === 'pin'
          ? parseFloat(getComputedStyle(element).getPropertyValue('--header-h'))
          : 0;
      const geometry = {
        scrollY: window.scrollY,
        top: rect.top + window.scrollY - inset,
        height: rect.height,
        viewport: window.innerHeight - inset,
      };
      element.style.setProperty(
        '--p',
        String((mode === 'pin' ? scrollProgress : passageProgress)(geometry)),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
    const bind = () => {
      stop();
      element.style.removeProperty('--p');
      if (media.matches) return;
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule, { passive: true });
      schedule();
    };
    bind();
    media.addEventListener('change', bind);
    return () => {
      stop();
      media.removeEventListener('change', bind);
    };
  }, [mode]);
  return ref;
}
