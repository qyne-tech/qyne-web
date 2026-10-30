import { useEffect, useState } from 'react';
import type { Article, ArticleDetail, Category } from '../data/articles';
import { fetchArticle, fetchArticles } from '../lib/articles-api';

/** A read from the service: still pending, failed, or its result. */
export type Loadable<T> =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T };

// One request per reading list for the life of the page, so clicking back and
// forth between categories does not refetch. A failure is not kept: the next
// mount tries again.
const lists = new Map<string, Promise<Article[]>>();

function cachedList(category?: Category): Promise<Article[]> {
  const key = category?.metric ?? '*';
  let pending = lists.get(key);
  if (!pending) {
    pending = fetchArticles(category);
    pending.catch(() => lists.delete(key));
    lists.set(key, pending);
  }
  return pending;
}

/** A category's reading list from the service, or every article when omitted. */
export function useArticles(category?: Category): Loadable<Article[]> {
  const [state, setState] = useState<{ key: string; value: Loadable<Article[]> }>();
  const key = category?.metric ?? '*';

  useEffect(() => {
    let isLive = true;
    cachedList(category).then(
      (data) => isLive && setState({ key, value: { status: 'ready', data } }),
      () => isLive && setState({ key, value: { status: 'error' } }),
    );
    return () => {
      isLive = false;
    };
  }, [key, category]);

  // A stale result from the previous category is never shown under a new one.
  return state?.key === key ? state.value : { status: 'loading' };
}

/** One article from the service; `data` is `null` when no article has this slug. */
export function useArticle(slug: string): Loadable<ArticleDetail | null> {
  const [state, setState] = useState<{ slug: string; value: Loadable<ArticleDetail | null> }>();

  useEffect(() => {
    let isLive = true;
    fetchArticle(slug).then(
      (data) => isLive && setState({ slug, value: { status: 'ready', data } }),
      () => isLive && setState({ slug, value: { status: 'error' } }),
    );
    return () => {
      isLive = false;
    };
  }, [slug]);

  return state?.slug === slug ? state.value : { status: 'loading' };
}
