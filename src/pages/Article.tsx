import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Section } from '../components/primitives/Container';
import { Eyebrow } from '../components/primitives/Eyebrow';
import { Seo } from '../components/primitives/Seo';
import { articleBySlug, articlesIn, categoryOf } from '../data/articles';

/**
 * One article.
 *
 * Nothing is written yet, so the page is the title and an honest line saying
 * so. Deliberately not filled with stand-in prose: a placeholder that reads
 * like an article is worse than an empty one, because the reader cannot tell
 * the difference and we are writing about their health. ADR-0006.
 *
 * `noindex` while the body is empty, so a search engine does not start ranking
 * thirty-five pages that say "coming soon".
 */
export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? articleBySlug(slug) : undefined;

  // An unknown slug goes back to the index rather than rendering blank. The app
  // deep-links by slug, so a renamed article must not leave a reader nowhere.
  if (!article) return <Navigate to="/articles" replace />;

  const category = categoryOf(article);
  const more = articlesIn(article.category).filter((a) => a.slug !== article.slug);

  return (
    <>
      <Seo
        title={`${article.title} — QYNE`}
        description={`${article.title}. Coming soon from QYNE.`}
        path={`/articles/${article.slug}`}
        noindex
      />

      <Section className="pt-32 sm:pt-36 lg:pt-40">
        <div className="mx-auto max-w-[68ch]">
          <Link
            to={category ? `/articles?category=${category.slug}` : '/articles'}
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft aria-hidden className="size-4" />
            {category ? category.label : 'All articles'}
          </Link>

          <h1 className="mt-6 text-h1 text-ink">{article.title}</h1>

          <div className="mt-10 rounded-lg border border-border bg-surface p-8 text-center">
            <Eyebrow tone="muted">Coming soon</Eyebrow>
            <p className="mt-3 text-lead text-muted">We are still writing this one.</p>
          </div>

          {more.length > 0 && (
            <div className="mt-14 border-t border-border pt-10">
              <Eyebrow>More on {category?.label.toLowerCase()}</Eyebrow>
              <ul className="mt-5 flex flex-col gap-1">
                {more.map((a) => (
                  <li key={a.slug}>
                    <Link
                      to={`/articles/${a.slug}`}
                      className="group flex items-baseline justify-between gap-4 rounded-md px-3 py-2.5 transition-colors hover:bg-surface"
                    >
                      <span className="text-sm text-muted group-hover:text-ink">{a.title}</span>
                      <span className="shrink-0 font-mono text-xs text-faint">Soon</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
