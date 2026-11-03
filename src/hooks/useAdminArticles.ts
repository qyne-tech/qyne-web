import { useCallback, useEffect, useRef, useState } from 'react';
import { listAdminArticles, type AdminArticle, type ArticleMetric } from '../lib/cms-api';
import type { Loadable } from './useArticles';

/** What to load: one metric's articles, every article, or nothing yet. */
export type AdminArticlesScope = ArticleMetric | 'all' | null;

/** One read, as a settled `Loadable`. The page shows a failure with a retry. */
function load(scope: ArticleMetric | 'all'): Promise<Loadable<AdminArticle[]>> {
  return listAdminArticles(scope === 'all' ? undefined : scope).then(
    (data) => ({ status: 'ready', data }),
    () => ({ status: 'error' }),
  );
}

/**
 * The CMS's view of the catalogue, drafts included. Not cached, unlike the
 * public reading lists: after a write the CMS calls `reload`, which resolves
 * once the fresh list is in, and the current list stays on screen until then.
 */
export function useAdminArticles(scope: AdminArticlesScope): {
  state: Loadable<AdminArticle[]>;
  reload: () => Promise<void>;
} {
  const key = scope ?? '';
  const [state, setState] = useState<{ key: string; value: Loadable<AdminArticle[]> }>();
  // Only the latest request may set the state; an older one landing late is dropped.
  const latestRequest = useRef(0);

  useEffect(() => {
    if (scope === null) return;
    const request = ++latestRequest.current;
    load(scope).then((value) => request === latestRequest.current && setState({ key, value }));
  }, [key, scope]);

  const reload = useCallback(async () => {
    if (scope === null) return;
    const request = ++latestRequest.current;
    const value = await load(scope);
    if (request === latestRequest.current) setState({ key, value });
  }, [key, scope]);

  // A list from another scope is never shown under this one.
  return { state: state?.key === key ? state.value : { status: 'loading' }, reload };
}
