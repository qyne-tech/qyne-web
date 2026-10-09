import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Section } from '../components/primitives/Container';
import { Card } from '../components/primitives/Card';
import { Eyebrow } from '../components/primitives/Eyebrow';
import { Seo } from '../components/primitives/Seo';
import { articleBySlug, articlesIn, categoryOf } from '../data/articles';

/**
 * One article.
 *
 * Every body in the catalogue is placeholder copy today, so the page leads with
 * that fact and puts the authoritative source one tap away. A reader who came
 * from the app looking for an answer should leave with one, even while ours is
 * unwritten.
 */
export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? articleBySlug(slug) : undefined;

  // An unknown slug is a 404, not an empty article. The app deep-links here by
  // slug, so a renamed article must fail loudly rather than render blank.
  if (!article) return <Navigate to="/articles" replace />;

  const category = categoryOf(article);
  const related = articlesIn(article.category).filter((a) => a.slug !== article.slug);

  return (
    <>
      <Seo
        title={`${article.title} — QYNE`}
        description={article.excerpt}
        path={`/articles/${article.slug}`}
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

          <p className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs text-faint">
            <span>{article.source}</span>
            <span aria-hidden>·</span>
            <span>{article.readTime}</span>
          </p>

          {/* Said plainly and up front, rather than in small print at the end. */}
          <Card interactive={false} className="mt-8 border-warning/30 bg-warning/5 p-5">
            <Eyebrow tone="muted">Placeholder</Eyebrow>
            <p className="mt-2 text-sm text-muted">
              We have not written this one yet. The link below goes to{' '}
              <span className="text-ink">{article.source}</span>, which covers it properly.
            </p>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
            >
              Read it at {article.source}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </Card>

          <div className="mt-10 flex flex-col gap-5">
            {article.body.map((paragraph, i) => (
              <p key={i} className="text-lead text-muted">
                {paragraph}
              </p>
            ))}
          </div>

          {related.length > 0 && (
            <div className="mt-16 border-t border-border pt-10">
              <Eyebrow>More on {category?.label.toLowerCase()}</Eyebrow>
              <ul className="mt-5 flex flex-col gap-3">
                {related.map((a) => (
                  <li key={a.slug}>
                    <Link
                      to={`/articles/${a.slug}`}
                      className="group flex items-baseline justify-between gap-4 rounded-md px-3 py-2.5 transition-colors hover:bg-surface"
                    >
                      <span className="text-sm text-muted group-hover:text-ink">{a.title}</span>
                      <span className="shrink-0 font-mono text-xs text-faint">{a.readTime}</span>
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
