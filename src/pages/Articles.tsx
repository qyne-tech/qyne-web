import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Search } from 'lucide-react';
import { Section } from '../components/primitives/Container';
import { Card } from '../components/primitives/Card';
import { Eyebrow } from '../components/primitives/Eyebrow';
import { Seo } from '../components/primitives/Seo';
import { PageIntro } from '../components/sections/PageIntro';
import { ARTICLES, CATEGORIES, articlesIn, type Article } from '../data/articles';
import { EASE } from '../components/animations/ScrollReveal';
import { cn } from '../lib/utils';

/**
 * The library index.
 *
 * Categories mirror the metric cards in the app one for one, because this page
 * is where those cards link to. A reader arriving from the HRV card should see
 * HRV selected, which is why the category lives in the query string rather than
 * in component state alone.
 */
export default function Articles() {
  const [params, setParams] = useSearchParams();
  const active = params.get('category');
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const base = active ? articlesIn(active) : ARTICLES;
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q),
    );
  }, [active, query]);

  const activeCategory = CATEGORIES.find((c) => c.slug === active);

  const select = (slug: string | null) => {
    const next = new URLSearchParams(params);
    if (slug) next.set('category', slug);
    else next.delete('category');
    setParams(next, { replace: true });
  };

  return (
    <>
      <Seo
        title="Articles — QYNE | Understand your own numbers"
        description="Plain-language guides to every metric QYNE measures: heart rate, HRV, VO2 max, sleep, strain, recovery, blood oxygen, temperature, calories and steps."
        path="/articles"
      />

      <PageIntro
        eyebrow="Articles"
        title="Understand your own numbers."
        subtitle="A guide for every metric in the app, in plain language. What it measures, what it does not, and what a change in it is actually worth."
      />

      <Section className="border-t border-border">
        <div className="grid gap-10 lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-14">
          {/* Sidebar: every category, plus the article count behind each. */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>Categories</Eyebrow>
            <nav aria-label="Article categories" className="mt-4 flex flex-col gap-0.5">
              <CategoryLink
                label="All articles"
                count={ARTICLES.length}
                active={!active}
                onClick={() => select(null)}
              />
              {CATEGORIES.map((c) => (
                <CategoryLink
                  key={c.slug}
                  label={c.label}
                  count={articlesIn(c.slug).length}
                  active={active === c.slug}
                  onClick={() => select(c.slug)}
                />
              ))}
            </nav>
          </aside>

          <div>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-h3 text-ink">
                  {activeCategory ? activeCategory.label : 'All articles'}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {activeCategory ? activeCategory.blurb : 'Every guide, newest sections first.'}
                </p>
              </div>

              <label className="relative sm:w-64">
                <span className="sr-only">Search articles</span>
                <Search
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full rounded-md border border-border bg-surface-2 py-2 pr-3 pl-9 text-sm text-ink placeholder:text-faint focus:border-faint focus:outline-none"
                />
              </label>
            </div>

            {shown.length === 0 ? (
              <p className="mt-10 text-sm text-muted">
                Nothing matches “{query}”.{' '}
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Clear the search
                </button>
                .
              </p>
            ) : (
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {shown.map((a, i) => (
                  <ArticleCard key={a.slug} article={a} index={i} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}

function CategoryLink({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
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
      <span className={cn('font-mono text-xs', active ? 'text-primary' : 'text-faint')}>
        {count}
      </span>
    </button>
  );
}

function ArticleCard({ article, index }: { article: Article; index: number }) {
  return (
    // Deliberately no opacity-0 entrance. A reading list that is invisible
    // until an animation runs is invisible whenever one does not, and this page
    // exists to be read. The lift on hover from `Card` is enough motion here.
    <motion.li
      initial={false}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.03, ease: EASE }}
    >
      <Card className="h-full">
        <Link to={`/articles/${article.slug}`} className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-h3 text-ink">{article.title}</h3>
            <ArrowUpRight aria-hidden className="mt-1 size-4 shrink-0 text-faint" />
          </div>
          <p className="text-sm text-muted">{article.excerpt}</p>
          <p className="mt-auto flex items-center gap-2 font-mono text-xs text-faint">
            <span>{article.source}</span>
            <span aria-hidden>·</span>
            <span>{article.readTime}</span>
          </p>
        </Link>
      </Card>
    </motion.li>
  );
}
