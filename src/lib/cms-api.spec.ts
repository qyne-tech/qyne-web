import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CmsApiError,
  createArticle,
  deleteArticle,
  listAdminArticles,
  reorderArticles,
  setPublished,
  updateArticle,
  type AdminArticle,
} from './cms-api';

const article: AdminArticle = {
  id: '6f1c2b8e-0d7a-4c55-9a51-3f0e2d1b9c11',
  slug: 'sleep-debt',
  metric: 'sleep',
  title: 'Sleep debt',
  source: 'QYNE',
  readMinutes: 5,
  url: null,
  thumbnailUrl: null,
  body: null,
  displayOrder: 0,
  published: false,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
};

const fetchMock = vi.fn<typeof fetch>();

function respond(status: number, body?: unknown): void {
  fetchMock.mockResolvedValueOnce(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    }),
  );
}

/** The one request the call made: its URL, method and parsed JSON body. */
function sentRequest(): { url: string; method: string; body: unknown } {
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, init] = fetchMock.mock.calls[0];
  return {
    url: String(url),
    method: init?.method ?? 'GET',
    body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
  };
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('requests', () => {
  it('lists one metric through the local CMS proxy', async () => {
    respond(200, [article]);
    await expect(listAdminArticles('sleep')).resolves.toEqual([article]);
    expect(sentRequest()).toEqual({
      url: '/cms-api/articles/admin?metric=sleep',
      method: 'GET',
      body: undefined,
    });
  });

  it('lists every metric when none is given', async () => {
    respond(200, []);
    await listAdminArticles();
    expect(sentRequest().url).toBe('/cms-api/articles/admin');
  });

  it('creates with POST /articles and the payload as given', async () => {
    respond(201, article);
    const payload = {
      slug: 'sleep-debt',
      metric: 'sleep' as const,
      title: 'Sleep debt',
      source: 'QYNE',
      readMinutes: 5,
      body: null,
      url: null,
      thumbnailUrl: null,
      published: false,
    };
    await expect(createArticle(payload)).resolves.toEqual(article);
    expect(sentRequest()).toEqual({ url: '/cms-api/articles', method: 'POST', body: payload });
  });

  it('updates with PATCH /articles/:id and only the changes', async () => {
    respond(200, article);
    await updateArticle(article.id, { title: 'New', url: null });
    expect(sentRequest()).toEqual({
      url: `/cms-api/articles/${article.id}`,
      method: 'PATCH',
      body: { title: 'New', url: null },
    });
  });

  it('publishes and unpublishes with PATCH /articles/:id/publish', async () => {
    respond(200, { ...article, published: true });
    await expect(setPublished(article.id, true)).resolves.toMatchObject({ published: true });
    expect(sentRequest()).toEqual({
      url: `/cms-api/articles/${article.id}/publish`,
      method: 'PATCH',
      body: { published: true },
    });
  });

  it('deletes with DELETE /articles/:id and reads no body from the 204', async () => {
    respond(204);
    await expect(deleteArticle(article.id)).resolves.toBeUndefined();
    expect(sentRequest()).toMatchObject({ url: `/cms-api/articles/${article.id}`, method: 'DELETE' });
  });

  it('reorders with the metric and its full id list', async () => {
    respond(200, [article]);
    await reorderArticles('sleep', ['b', 'a']);
    expect(sentRequest()).toEqual({
      url: '/cms-api/articles/reorder',
      method: 'POST',
      body: { metric: 'sleep', orderedIds: ['b', 'a'] },
    });
  });

  it('sends JSON headers only with a body', async () => {
    respond(200, []);
    await listAdminArticles();
    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Content-Type']).toBeUndefined();

    fetchMock.mockReset();
    respond(200, article);
    await updateArticle(article.id, { title: 'x' });
    const writeHeaders = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(writeHeaders['Content-Type']).toBe('application/json');
  });
});

describe('errors', () => {
  async function failure(call: Promise<unknown>): Promise<CmsApiError> {
    const error = await call.catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(CmsApiError);
    return error as CmsApiError;
  }

  it('shows NestJS’s message and keeps the status', async () => {
    respond(409, { statusCode: 409, message: 'An article already uses this slug.', error: 'Conflict' });
    const error = await failure(listAdminArticles());
    expect(error.status).toBe(409);
    expect(error.message).toBe('An article already uses this slug.');
  });

  it('joins a validation message list', async () => {
    respond(400, {
      statusCode: 400,
      message: ['title must be shorter than or equal to 200 characters', 'readMinutes must be an integer'],
      error: 'Bad Request',
    });
    const error = await failure(updateArticle(article.id, { title: 'x' }));
    expect(error.message).toBe(
      'title must be shorter than or equal to 200 characters. readMinutes must be an integer',
    );
  });

  it('says to wait when rate limited', async () => {
    respond(429, { statusCode: 429, message: 'ThrottlerException: Too Many Requests' });
    const error = await failure(setPublished(article.id, true));
    expect(error.status).toBe(429);
    expect(error.message).toBe('Too many requests, try again shortly');
  });

  it('falls back to the status when the body is not JSON', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Bad gateway', { status: 502 }));
    const error = await failure(deleteArticle(article.id));
    expect(error.status).toBe(502);
    expect(error.message).toBe('The request failed (502).');
  });

  it('reports a service that cannot be reached as status 0', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const error = await failure(listAdminArticles('sleep'));
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/could not reach qyne-service/i);
  });
});
