/**
 * The CMS article form's rules, kept free of React so they can be tested on
 * their own. They mirror the service's request validation; the service still
 * has the final word, and its message is shown when it disagrees.
 */
import {
  ARTICLE_METRICS,
  type AdminArticle,
  type ArticleCreate,
  type ArticleMetric,
  type ArticleUpdate,
} from './cms-api';

export const TITLE_MAX_LENGTH = 200;
export const SOURCE_MAX_LENGTH = 120;
export const SLUG_MAX_LENGTH = 120;
export const READ_MINUTES_MAX = 240;
export const BODY_MAX_LENGTH = 100_000;
const URL_MAX_LENGTH = 2048;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** The form as typed. Every field is the input's raw text. */
export interface ArticleFormValues {
  /** `''` until one is picked, when the form is opened from "All articles". */
  metric: ArticleMetric | '';
  title: string;
  source: string;
  readMinutes: string;
  slug: string;
  body: string;
  url: string;
  thumbnailUrl: string;
  published: boolean;
}

export type ArticleFormErrors = Partial<Record<keyof ArticleFormValues, string>>;

/** A blank form. `metric` is preset when the form is opened inside one. */
export function emptyArticleForm(metric: ArticleMetric | ''): ArticleFormValues {
  return {
    metric,
    title: '',
    source: '',
    readMinutes: '',
    slug: '',
    body: '',
    url: '',
    thumbnailUrl: '',
    published: false,
  };
}

/** The form pre-filled from a loaded article. The body is shown as stored. */
export function articleToForm(article: AdminArticle): ArticleFormValues {
  return {
    metric: article.metric,
    title: article.title,
    source: article.source,
    readMinutes: String(article.readMinutes),
    slug: article.slug,
    body: article.body ?? '',
    url: article.url ?? '',
    thumbnailUrl: article.thumbnailUrl ?? '',
    published: article.published,
  };
}

/** A slug suggested from a title: lowercase, anything else becomes a single hyphen. */
export function suggestSlug(title: string): string {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/^-+|-+$/g, '');
}

/** Errors for a new article, by field; empty when it can be sent. */
export function validateNewArticle(values: ArticleFormValues): ArticleFormErrors {
  const errors = validateEditableFields(values);
  if (!isArticleMetric(values.metric)) errors.metric = 'Choose a metric.';
  if (!values.slug) {
    errors.slug = 'Enter a slug.';
  } else if (values.slug.length > SLUG_MAX_LENGTH) {
    errors.slug = `Keep the slug to ${SLUG_MAX_LENGTH} characters.`;
  } else if (!SLUG_PATTERN.test(values.slug)) {
    errors.slug = 'Use lowercase letters and numbers, with single hyphens between words.';
  }
  return errors;
}

/** Errors for an edit, by field; empty when it can be sent. Slug and metric are fixed. */
export function validateArticleEdit(values: ArticleFormValues): ArticleFormErrors {
  return validateEditableFields(values);
}

function validateEditableFields(values: ArticleFormValues): ArticleFormErrors {
  const errors: ArticleFormErrors = {};
  const title = values.title.trim();
  const source = values.source.trim();

  if (!title) errors.title = 'Enter a title.';
  else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Keep the title to ${TITLE_MAX_LENGTH} characters.`;
  }

  if (!source) errors.source = 'Enter a source, e.g. QYNE.';
  else if (source.length > SOURCE_MAX_LENGTH) {
    errors.source = `Keep the source to ${SOURCE_MAX_LENGTH} characters.`;
  }

  const minutes = parseReadMinutes(values.readMinutes);
  if (minutes === null) {
    errors.readMinutes = `A whole number from 1 to ${READ_MINUTES_MAX}.`;
  }

  if (values.body.length > BODY_MAX_LENGTH) {
    errors.body = `Keep the body to ${BODY_MAX_LENGTH.toLocaleString('en')} characters.`;
  }
  if (!isOptionalHttpUrl(values.url)) errors.url = 'An absolute http(s) link, or leave it empty.';
  if (!isOptionalHttpUrl(values.thumbnailUrl)) {
    errors.thumbnailUrl = 'An absolute http(s) image link, or leave it empty.';
  }
  return errors;
}

/** `POST /articles` from a form that passed `validateNewArticle`. */
export function toCreatePayload(values: ArticleFormValues): ArticleCreate {
  if (!isArticleMetric(values.metric)) throw new Error('toCreatePayload: no metric chosen');
  return {
    slug: values.slug,
    metric: values.metric,
    title: values.title.trim(),
    source: values.source.trim(),
    readMinutes: Number(values.readMinutes.trim()),
    body: emptyToNull(values.body),
    url: emptyToNull(values.url.trim()),
    thumbnailUrl: emptyToNull(values.thumbnailUrl.trim()),
    published: values.published,
  };
}

/**
 * The `PATCH /articles/:id` body for an edit that passed `validateArticleEdit`:
 * only the fields that differ from `original`, or `null` when none do, so the
 * form can close without sending the empty object the service rejects.
 */
export function diffArticle(original: AdminArticle, values: ArticleFormValues): ArticleUpdate | null {
  const changes: ArticleUpdate = {};
  const title = values.title.trim();
  const source = values.source.trim();
  const readMinutes = Number(values.readMinutes.trim());
  const body = emptyToNull(values.body);
  const url = emptyToNull(values.url.trim());
  const thumbnailUrl = emptyToNull(values.thumbnailUrl.trim());

  if (title !== original.title) changes.title = title;
  if (source !== original.source) changes.source = source;
  if (readMinutes !== original.readMinutes) changes.readMinutes = readMinutes;
  if (body !== original.body) changes.body = body;
  if (url !== original.url) changes.url = url;
  if (thumbnailUrl !== original.thumbnailUrl) changes.thumbnailUrl = thumbnailUrl;

  return Object.keys(changes).length > 0 ? changes : null;
}

/** A real tag, as qyne-service tells HTML from plain text. "HR < 60" is not one. */
const TAG = /<\/?[a-z][a-z0-9-]*(\s[^<>]*)?\/?>/i;

/**
 * The body as HTML for the CMS preview, read the way the service reads it on
 * save: text with a tag in it is HTML; anything else is plain text, where a
 * blank line starts a paragraph and a single line break becomes `<br>`. The
 * HTML case is not sanitised here, so the preview must render it sandboxed.
 */
export function previewHtml(body: string): string {
  if (TAG.test(body)) return body;
  return body
    .replace(/\r\n?/g, '\n')
    .split(/\n[ \t]*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== '')
    .map((paragraph) => `<p>${escapeText(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function isArticleMetric(value: string): value is ArticleMetric {
  return (ARTICLE_METRICS as readonly string[]).includes(value);
}

function parseReadMinutes(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const minutes = Number(trimmed);
  return minutes >= 1 && minutes <= READ_MINUTES_MAX ? minutes : null;
}

function isOptionalHttpUrl(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (trimmed.length > URL_MAX_LENGTH) return false;
  try {
    const { protocol } = new URL(trimmed);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    // Not parseable as an absolute URL.
    return false;
  }
}

function emptyToNull(text: string): string | null {
  return text.trim() === '' ? null : text;
}
