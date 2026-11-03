import { describe, expect, it } from 'vitest';
import {
  articleToForm,
  diffArticle,
  emptyArticleForm,
  previewHtml,
  suggestSlug,
  toCreatePayload,
  validateArticleEdit,
  validateNewArticle,
  type ArticleFormValues,
} from './article-form';
import type { AdminArticle } from './cms-api';

const stored: AdminArticle = {
  id: '6f1c2b8e-0d7a-4c55-9a51-3f0e2d1b9c11',
  slug: 'sleep-debt',
  metric: 'sleep',
  title: 'Sleep debt',
  source: 'QYNE',
  readMinutes: 5,
  url: null,
  thumbnailUrl: 'https://cdn.example.com/sleep.jpg',
  body: '<p>One short night does not undo itself.</p>',
  displayOrder: 0,
  published: true,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
};

function newArticle(overrides: Partial<ArticleFormValues> = {}): ArticleFormValues {
  return {
    ...emptyArticleForm('sleep'),
    title: 'How much sleep do adults need?',
    source: 'CDC',
    readMinutes: '4',
    slug: 'how-much-sleep-do-adults-need',
    ...overrides,
  };
}

describe('suggestSlug', () => {
  it('lowercases and joins words with single hyphens', () => {
    expect(suggestSlug('How much sleep do adults need?')).toBe('how-much-sleep-do-adults-need');
  });

  it('collapses runs of other characters and trims hyphens at either end', () => {
    expect(suggestSlug('  VO2 max — what it is & isn’t!  ')).toBe('vo2-max-what-it-is-isn-t');
  });

  it('drops accents rather than the letters under them', () => {
    expect(suggestSlug('Café naps')).toBe('cafe-naps');
  });

  it('is empty for a title with no letters or digits', () => {
    expect(suggestSlug('?!')).toBe('');
  });

  it('stays within 120 characters without a trailing hyphen', () => {
    const slug = suggestSlug(`${'a'.repeat(119)} b`);
    expect(slug).toBe('a'.repeat(119));
  });
});

describe('validateNewArticle', () => {
  it('accepts a complete article', () => {
    expect(validateNewArticle(newArticle())).toEqual({});
  });

  it('requires a metric when the form was opened from All articles', () => {
    expect(validateNewArticle(newArticle({ metric: '' })).metric).toBeDefined();
  });

  it('requires title, source, read minutes and slug', () => {
    const errors = validateNewArticle(emptyArticleForm('sleep'));
    expect(Object.keys(errors).sort()).toEqual(['readMinutes', 'slug', 'source', 'title']);
  });

  it('treats a title of only spaces as empty', () => {
    expect(validateNewArticle(newArticle({ title: '   ' })).title).toBeDefined();
  });

  it('holds title and source to their lengths', () => {
    expect(validateNewArticle(newArticle({ title: 'x'.repeat(200) })).title).toBeUndefined();
    expect(validateNewArticle(newArticle({ title: 'x'.repeat(201) })).title).toBeDefined();
    expect(validateNewArticle(newArticle({ source: 'x'.repeat(120) })).source).toBeUndefined();
    expect(validateNewArticle(newArticle({ source: 'x'.repeat(121) })).source).toBeDefined();
  });

  it.each(['0', '241', '1.5', '-3', 'five', ''])('rejects %j read minutes', (readMinutes) => {
    expect(validateNewArticle(newArticle({ readMinutes })).readMinutes).toBeDefined();
  });

  it.each(['1', '240', ' 12 '])('accepts %j read minutes', (readMinutes) => {
    expect(validateNewArticle(newArticle({ readMinutes })).readMinutes).toBeUndefined();
  });

  it.each(['Sleep-debt', 'sleep--debt', '-sleep', 'sleep-', 'sleep debt'])(
    'rejects the slug %j',
    (slug) => {
      expect(validateNewArticle(newArticle({ slug })).slug).toBeDefined();
    },
  );

  it('holds the slug to 120 characters', () => {
    expect(validateNewArticle(newArticle({ slug: 'a'.repeat(120) })).slug).toBeUndefined();
    expect(validateNewArticle(newArticle({ slug: 'a'.repeat(121) })).slug).toBeDefined();
  });

  it('holds the body to 100,000 characters', () => {
    expect(validateNewArticle(newArticle({ body: 'x'.repeat(100_000) })).body).toBeUndefined();
    expect(validateNewArticle(newArticle({ body: 'x'.repeat(100_001) })).body).toBeDefined();
  });

  it('accepts empty links and absolute http(s) ones only', () => {
    expect(validateNewArticle(newArticle({ url: '', thumbnailUrl: '  ' }))).toEqual({});
    expect(validateNewArticle(newArticle({ url: 'https://www.cdc.gov/sleep' })).url).toBeUndefined();
    expect(validateNewArticle(newArticle({ url: 'www.cdc.gov/sleep' })).url).toBeDefined();
    expect(validateNewArticle(newArticle({ url: 'javascript:alert(1)' })).url).toBeDefined();
    expect(
      validateNewArticle(newArticle({ thumbnailUrl: 'ftp://cdn.example.com/a.jpg' })).thumbnailUrl,
    ).toBeDefined();
  });
});

describe('validateArticleEdit', () => {
  it('does not check the slug, which cannot change', () => {
    expect(validateArticleEdit({ ...articleToForm(stored), slug: 'Not A Slug' })).toEqual({});
  });
});

describe('toCreatePayload', () => {
  it('trims text, converts minutes, and sends empty optional fields as null', () => {
    const payload = toCreatePayload(
      newArticle({ title: '  Naps  ', readMinutes: ' 6 ', body: '  ', url: '', published: true }),
    );
    expect(payload).toEqual({
      slug: 'how-much-sleep-do-adults-need',
      metric: 'sleep',
      title: 'Naps',
      source: 'CDC',
      readMinutes: 6,
      body: null,
      url: null,
      thumbnailUrl: null,
      published: true,
    });
  });

  it('defaults to a draft', () => {
    expect(toCreatePayload(newArticle()).published).toBe(false);
  });
});

describe('diffArticle', () => {
  it('is null when nothing changed, so no PATCH is sent', () => {
    expect(diffArticle(stored, articleToForm(stored))).toBeNull();
  });

  it('is null when the only edits are spaces around title and source', () => {
    const values = { ...articleToForm(stored), title: ' Sleep debt ', source: 'QYNE ' };
    expect(diffArticle(stored, values)).toBeNull();
  });

  it('sends only the changed fields', () => {
    const values = { ...articleToForm(stored), title: 'Sleep debt, explained', readMinutes: '7' };
    expect(diffArticle(stored, values)).toEqual({ title: 'Sleep debt, explained', readMinutes: 7 });
  });

  it('clears a nullable field with null', () => {
    const values = { ...articleToForm(stored), thumbnailUrl: '', body: '' };
    expect(diffArticle(stored, values)).toEqual({ thumbnailUrl: null, body: null });
  });

  it('sets a field that was null', () => {
    const values = { ...articleToForm(stored), url: 'https://www.cdc.gov/sleep' };
    expect(diffArticle(stored, values)).toEqual({ url: 'https://www.cdc.gov/sleep' });
  });

  it('sends the body as typed once it differs from the stored HTML', () => {
    const values = { ...articleToForm(stored), body: 'First paragraph.\n\nSecond.' };
    expect(diffArticle(stored, values)).toEqual({ body: 'First paragraph.\n\nSecond.' });
  });

  it('never sends slug, metric or published', () => {
    const values: ArticleFormValues = {
      ...articleToForm(stored),
      slug: 'renamed',
      metric: 'hrv',
      published: false,
      title: 'Changed',
    };
    expect(diffArticle(stored, values)).toEqual({ title: 'Changed' });
  });
});

describe('previewHtml', () => {
  it('turns blank lines into paragraphs and single breaks into <br>', () => {
    expect(previewHtml('First line\nsame paragraph\n\n  Second  \r\n\r\nThird')).toBe(
      '<p>First line<br>same paragraph</p><p>Second</p><p>Third</p>',
    );
  });

  it('escapes plain text, so a bare < is shown, not parsed', () => {
    expect(previewHtml('HR < 60 & falling')).toBe('<p>HR &lt; 60 &amp; falling</p>');
  });

  it('passes HTML through as typed', () => {
    expect(previewHtml('<h2>Why</h2><p>Because.</p>')).toBe('<h2>Why</h2><p>Because.</p>');
  });

  it('is empty for an empty body', () => {
    expect(previewHtml('  \n\n ')).toBe('');
  });
});
