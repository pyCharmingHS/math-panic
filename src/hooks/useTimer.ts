import { useEffect, useState } from "react";

/**
 * Returns the current high-resolution timestamp, updated every animation
 * frame while `active`. Callers derive elapsed/remaining time from
 * timestamps (now - startedAt) rather than decrementing a counter, so
 * accuracy doesn't drift with render frequency.
 */
export function useTimer(active: boolean): number {
  const [now, setNow] = useState(() => performance.now());

  useEffect(() => {
    if (!active) return;
    let raf: number;
    const loop = (timestamp: number) => {
      setNow(timestamp);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return now;
}
