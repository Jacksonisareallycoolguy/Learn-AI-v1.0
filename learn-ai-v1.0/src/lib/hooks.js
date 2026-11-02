import { useEffect, useState } from 'react';

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Learn AI` : 'Learn AI';
  }, [title]);
}

export function useMediaQuery(query) {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

// Counts from 0 up to `target` (used for the XP reward).
export function useCountUp(target, run = true, duration = 900) {
  const reduce = usePrefersReducedMotion();
  const [value, setValue] = useState(run && !reduce ? 0 : target);
  useEffect(() => {
    if (!run || reduce || target <= 0) {
      setValue(target);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, run, reduce, duration]);
  return value;
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
