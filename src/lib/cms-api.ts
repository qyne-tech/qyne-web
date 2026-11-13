/**
 * The article CMS's calls to qyne-service: the authoring list (drafts
 * included) and every write. Each request goes through `cmsRequest`, the one
 * place the admin's credentials will be attached once the service guards these
 * routes (CMS-S1).
 *
 * Where it runs: `npm run dev`, talking to a local service through the
 * `/cms-api` proxy (see vite.config.ts); and staging builds made with
 * `VITE_ENABLE_CMS=true`, talking to the staging API via `apiUrl()`. The
 * deploy workflow forces the flag off for production.
 */
import { apiUrl } from './site';

/** The service's metric keys, in the order the app and the site list them. */
export const ARTICLE_METRICS = [
  'heart_rate',
  'resting_heart_rate',
  'hrv',
  'vo2_max',
  'strain',
  'stress',
  'sleep',
  'spo2',
  'skin_temperature',
  'calories',
  'steps',
  'workouts',
  'recovery',
] as const;

export type ArticleMetric = (typeof ARTICLE_METRICS)[number];

/** An article as the admin and write routes return it. */
export interface AdminArticle {
  id: string;
  slug: string;
  metric: ArticleMetric;
  title: string;
  source: string;
  readMinutes: number;
  url: string | null;
  thumbnailUrl: string | null;
  /** Sanitised HTML. */
  body: string | null;
  displayOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

/** `POST /articles`. The server appends the article to its metric's list. */
export interface ArticleCreate {
  slug: string;
  metric: ArticleMetric;
  title: string;
  source: string;
  readMinutes: number;
  body: string | null;
  url: string | null;
  thumbnailUrl: string | null;
  published: boolean;
}

/**
 * `PATCH /articles/:id`: only the fields that changed. Slug and metric are
 * permanent, so the type has no room for them; `null` clears a nullable field.
 */
export interface ArticleUpdate {
  title?: string;
  source?: string;
  readMinutes?: number;
  body?: string | null;
  url?: string | null;
  thumbnailUrl?: string | null;
}

/** The local proxy in dev; the deployment's API (staging) in an enabled build. */
function cmsBase(): string {
  return import.meta.env.DEV ? '/cms-api' : apiUrl();
}

const UNREACHABLE = import.meta.env.DEV
  ? 'Could not reach qyne-service. Is it running locally?'
  : 'Could not reach qyne-service.';

const TOO_MANY_REQUESTS = 'Too many requests, try again shortly';

/** A request the service refused, or one that never reached it (`status` 0). */
export class CmsApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'CmsApiError';
    this.status = status;
  }
}

/** Every CMS request. The admin's auth header goes here once CMS-S1 lands. */
async function cmsRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(`${cmsBase()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new CmsApiError(0, UNREACHABLE);
  }

  if (!response.ok) throw new CmsApiError(response.status, await errorMessage(response));
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** The message to show for a failed request, from NestJS's error body when it has one. */
async function errorMessage(response: Response): Promise<string> {
  if (response.status === 429) return TOO_MANY_REQUESTS;
  const fallback = `The request failed (${response.status}).`;
  try {
    const payload = (await response.json()) as { message?: unknown };
    if (typeof payload.message === 'string' && payload.message) return payload.message;
    if (Array.isArray(payload.message) && payload.message.length > 0) {
      return payload.message.join('. ');
    }
    return fallback;
  } catch {
    // Not JSON: a proxy error page, or an empty body.
    return fallback;
  }
}

/** Every article, drafts included: one metric's in display order, or all grouped by metric. */
export function listAdminArticles(metric?: ArticleMetric): Promise<AdminArticle[]> {
  const query = metric ? `?metric=${encodeURIComponent(metric)}` : '';
  return cmsRequest('GET', `/articles/admin${query}`);
}

export function createArticle(article: ArticleCreate): Promise<AdminArticle> {
  return cmsRequest('POST', '/articles', article);
}

export function updateArticle(id: string, changes: ArticleUpdate): Promise<AdminArticle> {
  return cmsRequest('PATCH', `/articles/${encodeURIComponent(id)}`, changes);
}

export function setPublished(id: string, published: boolean): Promise<AdminArticle> {
  return cmsRequest('PATCH', `/articles/${encodeURIComponent(id)}/publish`, { published });
}

export function deleteArticle(id: string): Promise<void> {
  return cmsRequest('DELETE', `/articles/${encodeURIComponent(id)}`);
}

/** Sets a metric's order. `orderedIds` must hold every one of its articles. */
export function reorderArticles(
  metric: ArticleMetric,
  orderedIds: string[],
): Promise<AdminArticle[]> {
  return cmsRequest('POST', '/articles/reorder', { metric, orderedIds });
}
