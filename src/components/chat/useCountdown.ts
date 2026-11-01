'use client';

import { useEffect, useState } from 'react';

/** An absolute deadline prevents throttled timer ticks extending the server delay. */
export function useCountdown(delay: number | undefined): number {
  const [seconds, setSeconds] = useState(delay ?? 0);
  const [deadline] = useState(() => Date.now() + (delay ?? 0) * 1000);
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => {
      setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds, deadline]);
  return seconds;
}
