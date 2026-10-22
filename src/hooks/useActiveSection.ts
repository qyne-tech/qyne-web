import { useEffect, useState } from 'react';

/**
 * Which of `ids` is currently being read, for highlighting a table of contents.
 *
 * Tracks the set of sections crossing a band near the top of the viewport and
 * returns the first of them in document order, rather than the last element to
 * fire an event: entry order is not document order, and scrolling upwards
 * otherwise highlights the section you have just left.
 *
 * An IntersectionObserver rather than a scroll listener, so this costs nothing
 * while the page sits still and does not fight the smooth-scroll engine.
 */
const ACTIVE_BAND = '-18% 0px -72% 0px';

export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  /* ids is rebuilt on every render by the caller's .map(); joining it keeps the
     effect keyed on the contents rather than the array identity. */
  const key = ids.join('|');

  useEffect(() => {
    const sections = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = sections.find((el) => visible.has(el.id));
        // Keep the last known heading when the band falls between sections,
        // so the marker never blanks out mid-scroll.
        if (first) setActive(first.id);
      },
      { rootMargin: ACTIVE_BAND },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return active;
}
