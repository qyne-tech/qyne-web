import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '../primitives/Button';
import { fieldClass, fieldErrorClass } from '../primitives/field-styles';
import { CATEGORIES, categoryByMetric } from '../../data/articles';
import { useModalDialog } from '../../hooks/useModalDialog';
import {
  articleToForm,
  BODY_MAX_LENGTH,
  diffArticle,
  emptyArticleForm,
  isArticleMetric,
  previewHtml,
  suggestSlug,
  toCreatePayload,
  validateArticleEdit,
  validateNewArticle,
  type ArticleFormErrors,
  type ArticleFormValues,
} from '../../lib/article-form';
import {
  CmsApiError,
  createArticle,
  updateArticle,
  type AdminArticle,
  type ArticleMetric,
} from '../../lib/cms-api';
import { cn } from '../../lib/utils';
import articleBodyCss from '../../styles/article-body.css?raw';

const BODY_TABS = [
  { id: 'write', label: 'Write' },
  { id: 'preview', label: 'Preview' },
] as const;

/** What the modal is for: a new article (in a metric, or with one to pick), or an edit. */
export type ArticleModalTarget =
  | { kind: 'create'; metric: ArticleMetric | null }
  | { kind: 'edit'; article: AdminArticle };

/**
 * Add or edit an article, in a modal over the list. The page's URL does not
 * change. An edit sends only the fields that changed and closes without a
 * request when none did. On failure the admin's input stays as typed and the
 * service's message is shown.
 */
export function ArticleModal({
  target,
  onClose,
  onSaved,
  onGone,
}: {
  target: ArticleModalTarget;
  onClose: () => void;
  onSaved: () => void;
  /** The article being edited was deleted elsewhere (404). */
  onGone: () => void;
}) {
  const original = target.kind === 'edit' ? target.article : null;
  const [values, setValues] = useState<ArticleFormValues>(() =>
    original ? articleToForm(original) : emptyArticleForm(target.kind === 'create' ? (target.metric ?? '') : ''),
  );
  const [errors, setErrors] = useState<ArticleFormErrors>({});
  const [formError, setFormError] = useState<string>();
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const dialogRef = useModalDialog(() => {
    if (!isSaving) onClose();
  });

  const changes = useMemo(() => (original ? diffArticle(original, values) : null), [original, values]);
  const changedCount = changes ? Object.keys(changes).length : 0;
  const isMetricFixed = target.kind === 'edit' || target.metric !== null;
  const metricLabel = isArticleMetric(values.metric) ? categoryByMetric(values.metric)?.label : undefined;

  const update = <K extends keyof ArticleFormValues>(field: K, value: ArticleFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const updateTitle = (title: string) => {
    setValues((current) => ({
      ...current,
      title,
      // The slug follows the title until the admin edits it themselves.
      slug: original || isSlugEdited ? current.slug : suggestSlug(title),
    }));
    setErrors((current) => ({ ...current, title: undefined, slug: undefined }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = original ? validateArticleEdit(values) : validateNewArticle(values);
    setErrors(found);
    setFormError(undefined);
    if (Object.keys(found).length > 0) return;
    if (original && !changes) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      if (original && changes) await updateArticle(original.id, changes);
      else await createArticle(toCreatePayload(values));
      onSaved();
    } catch (caught) {
      setIsSaving(false);
      if (!(caught instanceof CmsApiError)) {
        setFormError('The article could not be saved.');
        return;
      }
      if (original && caught.status === 404) {
        onGone();
        return;
      }
      if (!original && caught.status === 409) {
        setErrors({ slug: 'This slug is taken' });
        return;
      }
      setFormError(caught.message);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="article-modal-title"
      className="relative m-auto max-h-[calc(100dvh-4rem)] w-[min(780px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface p-0 text-ink shadow-[0_24px_80px_rgb(0_0_0/0.55),0_0_60px_color-mix(in_srgb,var(--color-primary)_8%,transparent)] backdrop:bg-bg/75 backdrop:backdrop-blur-sm open:flex open:flex-col"
    >
      {/* A hairline of the brand colour along the top edge. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-primary)_70%,transparent),transparent)]"
      />

      <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
        <header className="relative border-b border-border bg-[radial-gradient(ellipse_60%_120%_at_0%_0%,color-mix(in_srgb,var(--color-primary)_7%,transparent),transparent_70%)] px-8 pt-7 pb-5">
          <span className="inline-flex items-center gap-2.5">
            <span aria-hidden className="h-px w-7 bg-primary" />
            <span className="label text-primary">
              {target.kind === 'edit'
                ? `${metricLabel ?? 'Article'} · Edit`
                : `${target.metric ? metricLabel : 'All articles'} · New`}
            </span>
          </span>
          <h2 id="article-modal-title" className="mt-3 text-[28px] leading-[1.15] font-medium tracking-[-0.02em]">
            {original ? 'Edit article' : 'Add article'}
          </h2>
          <p className="mt-1.5 text-[13px] text-faint">
            {original
              ? 'Only the fields you change are saved.'
              : target.kind === 'create' && target.metric
                ? `It goes to the end of the ${metricLabel} list.`
                : 'Pick the metric it belongs to. It goes to the end of that metric’s list.'}
          </p>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            className="absolute top-6 right-6 grid size-9 place-items-center rounded-md border border-border text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X aria-hidden className="size-4" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-x-5 gap-y-4.5 overflow-y-auto px-8 py-6 sm:grid-cols-2">
          {formError && (
            <p
              role="alert"
              className="rounded-md border border-danger/40 bg-danger/8 px-3.5 py-3 text-[13px] sm:col-span-2"
            >
              {formError}
            </p>
          )}

          {!isMetricFixed && (
            <Field label="Metric" htmlFor="article-metric" error={errors.metric} wide
              hint="Required. It can’t be changed after creation.">
              <div className="relative">
                <select
                  id="article-metric"
                  value={values.metric}
                  onChange={(e) => update('metric', e.target.value as ArticleFormValues['metric'])}
                  className={cn(fieldClass, 'cursor-pointer appearance-none pr-9', errors.metric && fieldErrorClass)}
                >
                  <option value="" disabled>
                    Choose a metric…
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c.metric} value={c.metric}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden
                  size={16}
                  className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-faint"
                />
              </div>
            </Field>
          )}

          <Field label="Title" htmlFor="article-title" error={errors.title} wide>
            <input
              id="article-title"
              value={values.title}
              onChange={(e) => updateTitle(e.target.value)}
              className={cn(fieldClass, errors.title && fieldErrorClass)}
              autoFocus
            />
          </Field>

          <Field label="Source" htmlFor="article-source" error={errors.source}>
            <input
              id="article-source"
              value={values.source}
              onChange={(e) => update('source', e.target.value)}
              placeholder="QYNE"
              className={cn(fieldClass, errors.source && fieldErrorClass)}
            />
          </Field>

          <Field label="Read minutes" htmlFor="article-minutes" error={errors.readMinutes}>
            <input
              id="article-minutes"
              inputMode="numeric"
              value={values.readMinutes}
              onChange={(e) => update('readMinutes', e.target.value)}
              className={cn(fieldClass, errors.readMinutes && fieldErrorClass)}
            />
          </Field>

          {original ? (
            <Field label="Slug" wide hint="The slug can’t be changed after creation. The app and site link to it.">
              <p className="flex h-11 items-center rounded-md border border-dashed border-border px-3.5 font-mono text-[13px] text-muted">
                /articles/{original.slug}
              </p>
            </Field>
          ) : (
            <Field
              label="Slug"
              htmlFor="article-slug"
              error={errors.slug}
              wide
              hint="Suggested from the title: lowercase words joined by hyphens. It can’t be changed after creation."
            >
              <input
                id="article-slug"
                value={values.slug}
                onChange={(e) => {
                  setIsSlugEdited(true);
                  update('slug', e.target.value);
                }}
                spellCheck={false}
                className={cn(fieldClass, errors.slug && fieldErrorClass)}
              />
            </Field>
          )}

          <GroupLabel>Content</GroupLabel>

          <div className="sm:col-span-2">
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="article-body" className="text-[13px] font-medium text-muted">
                Body <span className="font-normal text-faint">(optional)</span>
              </label>
              <div role="tablist" aria-label="Body view" className="flex gap-0.5">
                {BODY_TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={tab === id}
                    onClick={() => setTab(id)}
                    className={cn(
                      'rounded-md px-3 py-1 text-[13px] transition-colors',
                      tab === id ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {tab === 'write' ? (
              <textarea
                id="article-body"
                value={values.body}
                onChange={(e) => update('body', e.target.value)}
                maxLength={BODY_MAX_LENGTH}
                className={cn(
                  fieldClass,
                  'h-60 resize-y py-3 font-mono text-[12.5px] leading-[1.65]',
                  errors.body && fieldErrorClass,
                )}
              />
            ) : (
              <BodyPreview body={values.body} />
            )}
            {errors.body ? (
              <p className="mt-1.5 text-xs text-danger">{errors.body}</p>
            ) : (
              <p className="mt-1.5 text-xs text-faint">
                Plain text or HTML. A blank line starts a new paragraph.
              </p>
            )}
          </div>

          <GroupLabel>Links</GroupLabel>

          <Field label="Publisher URL" optional htmlFor="article-url" error={errors.url}>
            <input
              id="article-url"
              type="url"
              value={values.url}
              onChange={(e) => update('url', e.target.value)}
              placeholder="https://"
              className={cn(fieldClass, errors.url && fieldErrorClass)}
            />
          </Field>

          <Field label="Thumbnail URL" optional htmlFor="article-thumbnail" error={errors.thumbnailUrl}>
            <input
              id="article-thumbnail"
              type="url"
              value={values.thumbnailUrl}
              onChange={(e) => update('thumbnailUrl', e.target.value)}
              placeholder="https://"
              className={cn(fieldClass, errors.thumbnailUrl && fieldErrorClass)}
            />
          </Field>
        </div>

        <footer className="flex items-center gap-2 border-t border-border bg-bg px-8 py-4">
          {original ? (
            <span className="mr-auto font-mono text-xs text-faint">
              {changedCount === 0
                ? 'No changes'
                : `${changedCount} field${changedCount === 1 ? '' : 's'} changed`}
            </span>
          ) : (
            <label className="mr-auto flex cursor-pointer items-center gap-2.5 text-sm text-muted">
              <input
                type="checkbox"
                checked={values.published}
                onChange={(e) => update('published', e.target.checked)}
                className="size-4 accent-primary"
              />
              Publish now <span className="text-faint">— off saves a draft</span>
            </label>
          )}
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : original ? 'Save changes' : 'Create article'}
          </Button>
        </footer>
      </form>
    </dialog>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  wide,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  /** Spans both columns. */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn(wide && 'sm:col-span-2')}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-muted">
        {label} {optional && <span className="font-normal text-faint">(optional)</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      {hint && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
    </div>
  );
}

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-1.5 sm:col-span-2">
      <span className="label text-faint">{children}</span>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}

/** Design tokens the preview frame needs, copied in from the page. */
const PREVIEW_TOKENS = [
  '--color-surface-2',
  '--color-border',
  '--color-ink',
  '--color-muted',
  '--color-faint',
  '--color-primary',
  '--color-primary-light',
  '--font-sans',
  '--text-lead',
  '--text-lead--line-height',
  '--text-h3',
  '--text-h3--line-height',
  '--radius-lg',
];

/**
 * The body as it will read once saved. The text here has not been through the
 * service's sanitiser yet, so it is rendered in a sandboxed frame: no scripts,
 * and no access to this page.
 */
function BodyPreview({ body }: { body: string }) {
  const html = previewHtml(body);
  const frameDocument = useMemo(() => {
    const root = getComputedStyle(document.documentElement);
    const tokens = PREVIEW_TOKENS.map((name) => `${name}:${root.getPropertyValue(name)}`).join(';');
    return `<!doctype html><html><head><meta charset="utf-8"><style>:root{${tokens}}body{margin:0;padding:16px;background:var(--color-surface-2);font-family:var(--font-sans)}${articleBodyCss}</style></head><body><div class="article-body">${html}</div></body></html>`;
  }, [html]);

  if (!html) {
    return (
      <p className="flex h-60 items-center justify-center rounded-md border border-border bg-surface-2 text-sm text-faint">
        Nothing to preview yet.
      </p>
    );
  }
  return (
    <iframe
      title="Body preview"
      sandbox=""
      srcDoc={frameDocument}
      className="h-60 w-full rounded-md border border-border bg-surface-2"
    />
  );
}
