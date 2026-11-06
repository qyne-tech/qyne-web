/**
 * Reordering a metric's reading list. The service takes the whole list in its
 * new order (`POST /articles/reorder`), so both the arrow buttons and a drag
 * produce one: the arrows move an article by one place, a drag by any number.
 */

/** `ids` with the item at `from` moved to index `to`; `ids` itself is not changed. */
export function moveId(ids: readonly string[], from: number, to: number): string[] {
  const next = [...ids];
  if (from === to || from < 0 || to < 0 || from >= ids.length || to >= ids.length) return next;
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
