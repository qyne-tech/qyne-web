import { describe, expect, it } from 'vitest';
import { moveId } from './article-order';

describe('moveId', () => {
  const ids = ['a', 'b', 'c', 'd'];

  it('moves an article one place earlier, as the ← button does', () => {
    expect(moveId(ids, 2, 1)).toEqual(['a', 'c', 'b', 'd']);
  });

  it('moves an article one place later, as the → button does', () => {
    expect(moveId(ids, 1, 2)).toEqual(['a', 'c', 'b', 'd']);
  });

  it('moves an article several places, as a drag does', () => {
    expect(moveId(ids, 3, 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(moveId(ids, 0, 3)).toEqual(['b', 'c', 'd', 'a']);
  });

  it('leaves the order alone for a move past either end', () => {
    expect(moveId(ids, 0, -1)).toEqual(ids);
    expect(moveId(ids, 3, 4)).toEqual(ids);
  });

  it('does not change the list it was given', () => {
    const original = [...ids];
    moveId(ids, 0, 2);
    expect(ids).toEqual(original);
  });
});
