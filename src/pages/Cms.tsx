import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ArticleGrid } from '../components/cms/ArticleGrid';
import { ArticleModal, type ArticleModalTarget } from '../components/cms/ArticleModal';
import { ConfirmDelete } from '../components/cms/ConfirmDelete';
import { Nav } from '../components/layout/Nav';
import { Button } from '../components/primitives/Button';
import { Container } from '../components/primitives/Container';
import { Eyebrow } from '../components/primitives/Eyebrow';
import { Seo } from '../components/primitives/Seo';
import { CATEGORIES, categoryByMetric } from '../data/articles';
import { useAdminArticles } from '../hooks/useAdminArticles';
import {
  CmsApiError,
  reorderArticles,
  setPublished,
  type AdminArticle,
  type ArticleMetric,
} from '../lib/cms-api';
import { isArticleMetric } from '../lib/article-form';
import { cn } from '../lib/utils';

/**
 * The article CMS: add, edit, publish, order and delete the articles behind
 * every metric. The same layout as the public library (`/articles`), with
 * drafts shown and the admin's actions on each card.
 *
 * Dev only (see App.tsx): the service's write routes are unguarded until
 * CMS-S1, so this page talks only to a local qyne-service, through the
 * `/cms-api` proxy. Edits open in a modal; the URL never changes.
 */
export default function Cms() {
  const [selected, setSelected] = useState<ArticleMetric | null>(null);
  // Every article, for the sidebar's counts and the "All articles" view; and
  // the selected metric's list, read on its own as `?metric=`.
  const all = useAdminArticles('all');
  const metricList = useAdminArticles(selected);
  const shown = selected ? metricList.state : all.state;

  const [modal, setModal] = useState<ArticleModalTarget | null>(null);
  const [deleting, setDeleting] = useState<AdminArticle | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string>();

  const reloadLists = () => Promise.all([all.reload(), metricList.reload()]).then(() => undefined);

  /** Runs one write, then reloads, keeping every action disabled until the fresh list is in. */
  const runWrite = async (write: () => Promise<unknown>) => {
    setIsBusy(true);
    setActionError(undefined);
    try {
      await write();
    } catch (caught) {
      setActionError(
        caught instanceof CmsApiError && caught.status === 404
          ? 'That article no longer exists. The list has been refreshed.'
          : caught instanceof Error
            ? caught.message
            : 'The change could not be saved.',
      );
    }
    await reloadLists();
    setIsBusy(false);
  };

  const afterModalWrite = (message?: string) => {
    setModal(null);
    setDeleting(null);
    setActionError(message);
    setIsBusy(true);
    void reloadLists().then(() => setIsBusy(false));
  };

  const selectedCategory = selected ? categoryByMetric(selected) : undefined;
  const countIn = (metric: string) =>
    all.state.status === 'ready' ? all.state.data.filter((a) => a.metric === metric).length : undefined;

  const gridProps = (metric: ArticleMetric) => ({
    isBusy,
    onReorder: (orderedIds: string[]) => runWrite(() => reorderArticles(metric, orderedIds)),
    onEdit: (article: AdminArticle) => setModal({ kind: 'edit', article }),
    onTogglePublished: (article: AdminArticle) =>
      runWrite(() => setPublished(article.id, !article.published)),
    onDelete: (article: AdminArticle) => setDeleting(article),
  });

  return (
    <>
      <Seo
        title="Article CMS — QYNE"
        description="Add, edit, publish and order QYNE’s articles."
        path="/cms"
        noindex
      />

      {/* The site's own header, as on every page. It has no link here: the CMS
          is reached by typing /cms. */}
      <Nav />

      <section className="relative overflow-hidden border-b border-border pt-26 pb-8">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_70%_90%_at_30%_50%,#000_20%,transparent_75%)]" />
        <Container className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Article CMS</Eyebrow>
            <p className="mt-3 text-[15px] text-muted">
              Add, edit, publish and order the articles behind every metric. Drafts are visible only
              here.
            </p>
          </div>
          <span className="shrink-0 font-mono text-[11px] font-medium tracking-[0.06em] text-warning">
            DEV ONLY · writes go to a local qyne-service
          </span>
        </Container>
      </section>

      <main id="main" className="pt-12 pb-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-14">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <Eyebrow>Metrics</Eyebrow>
              <nav aria-label="Article metrics" className="mt-4 flex flex-col gap-0.5">
                <SidebarLink
                  label="All articles"
                  count={all.state.status === 'ready' ? all.state.data.length : undefined}
                  active={!selected}
                  onClick={() => setSelected(null)}
                />
                {CATEGORIES.map((c) => (
                  <SidebarLink
                    key={c.metric}
                    label={c.label}
                    count={countIn(c.metric)}
                    active={selected === c.metric}
                    onClick={() => isArticleMetric(c.metric) && setSelected(c.metric)}
                  />
                ))}
              </nav>
            </aside>

            <div>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-h3 text-ink">{selectedCategory?.label ?? 'All articles'}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {selectedCategory
                      ? selectedCategory.blurb
                      : 'Every article, drafts included, grouped by metric. Order is set within each metric.'}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setModal({ kind: 'create', metric: selected })}
                  disabled={isBusy}
                >
                  <Plus aria-hidden className="size-4" />
                  Add article
                </Button>
              </div>

              {actionError && (
                <p
                  role="alert"
                  className="mt-6 flex items-start justify-between gap-4 rounded-md border border-danger/40 bg-danger/8 px-3.5 py-3 text-[13px]"
                >
                  {actionError}
                  <button
                    type="button"
                    onClick={() => setActionError(undefined)}
                    className="shrink-0 text-muted hover:text-ink"
                  >
                    Dismiss
                  </button>
                </p>
              )}

              {shown.status === 'loading' ? (
                <p className="mt-10 text-sm text-muted">Loading articles…</p>
              ) : shown.status === 'error' ? (
                <p className="mt-10 text-sm text-muted">
                  The articles could not be loaded.
                  {import.meta.env.DEV && ' Is qyne-service running locally?'}{' '}
                  <button
                    type="button"
                    onClick={() => void reloadLists()}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Try again
                  </button>
                </p>
              ) : selected ? (
                shown.data.length === 0 ? (
                  <EmptyMetric
                    label={selectedCategory?.label ?? selected}
                    onAdd={() => setModal({ kind: 'create', metric: selected })}
                  />
                ) : (
                  <div className="mt-8">
                    <ArticleGrid articles={shown.data} {...gridProps(selected)} />
                  </div>
                )
              ) : (
                CATEGORIES.map((c) => {
                  if (!isArticleMetric(c.metric)) return null;
                  const metric = c.metric;
                  const articles = shown.data.filter((a) => a.metric === metric);
                  return (
                    <section key={metric} aria-label={c.label} className="mt-10 first:mt-8">
                      <div className="flex items-center gap-3">
                        <span className="label text-primary">{c.label}</span>
                        <span className="font-mono text-xs text-faint">{articles.length}</span>
                        <span aria-hidden className="h-px flex-1 bg-border" />
                        <button
                          type="button"
                          onClick={() => setModal({ kind: 'create', metric })}
                          disabled={isBusy}
                          className="inline-flex h-[30px] items-center gap-1.5 rounded-md border border-border px-3 text-[13px] text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-50"
                        >
                          <Plus aria-hidden className="size-3.5" />
                          Add to {c.label}
                        </button>
                      </div>
                      {articles.length === 0 ? (
                        <p className="mt-4 text-sm text-faint">No articles for {c.label} yet.</p>
                      ) : (
                        <div className="mt-4">
                          <ArticleGrid articles={articles} {...gridProps(metric)} />
                        </div>
                      )}
                    </section>
                  );
                })
              )}
            </div>
          </div>
        </Container>
      </main>

      {modal && (
        <ArticleModal
          target={modal}
          onClose={() => setModal(null)}
          onSaved={() => afterModalWrite()}
          onGone={() => afterModalWrite('That article no longer exists. The list has been refreshed.')}
        />
      )}

      {deleting && (
        <ConfirmDelete
          article={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => afterModalWrite()}
        />
      )}
    </>
  );
}

function SidebarLink({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  /** Undefined until the catalogue has loaded. */
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
        active ? 'bg-surface-2 text-ink' : 'text-muted hover:bg-surface hover:text-ink',
      )}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className={cn('font-mono text-xs', active ? 'text-primary' : 'text-faint')}>
          {count}
        </span>
      )}
    </button>
  );
}

function EmptyMetric({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <p className="mt-10 text-sm text-muted">
      No articles for {label} yet.{' '}
      <button
        type="button"
        onClick={onAdd}
        className="text-primary underline-offset-4 hover:underline"
      >
        Add the first one
      </button>
      .
    </p>
  );
}
