/**
 * Reads the article catalogue from qyne-service. Public and unauthenticated:
 * the same for every reader, and it says nothing about any of them.
 */
import { CATEGORIES, type Article, type ArticleDetail, type Category } from '../data/articles';
import { apiUrl } from './site';

/** An article as `GET /articles` and `GET /articles/{slug}` return it. */
interface ArticleResponse {
  slug: string;
  metric: string;
  title: string;
  source: string;
  readMinutes: number;
  url: string | null;
  body?: string | null;
}

/**
 * The published articles: one category's reading list in order, or every one
 * when `category` is omitted. A failed read rejects.
 */
export async function fetchArticles(category?: Category): Promise<Article[]> {
  const query = category ? `?metric=${encodeURIComponent(category.metric)}` : '';
  const response = await fetch(apiUrl(`/articles${query}`));
  if (!response.ok) throw new Error(`GET /articles failed: ${response.status}`);
  const rows = (await response.json()) as ArticleResponse[];
  return rows.map(toArticle);
}

/** One article with its body; `null` when none is published under `slug`. */
export async function fetchArticle(slug: string): Promise<ArticleDetail | null> {
  const response = await fetch(apiUrl(`/articles/${encodeURIComponent(slug)}`));
  // 400 is a malformed slug, which can no more exist than an unknown one.
  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) throw new Error(`GET /articles/${slug} failed: ${response.status}`);
  const row = (await response.json()) as ArticleResponse;
  return { ...toArticle(row), body: row.body ?? null };
}

function toArticle(row: ArticleResponse): Article {
  return {
    slug: row.slug,
    title: row.title,
    // A metric the site has no category for yet still shows under "All".
    category: CATEGORIES.find((c) => c.metric === row.metric)?.slug ?? row.metric,
    source: row.source,
    readMinutes: row.readMinutes,
    url: row.url,
  };
}
