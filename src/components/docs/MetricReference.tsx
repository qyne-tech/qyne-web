import type { ReactNode } from 'react';
import { METRIC_DOCS, METRIC_GROUPS, metricsIn } from '../../data/metricDocs';
import { useActiveSection } from '../../hooks/useActiveSection';
import { cn } from '../../lib/utils';
import { MetricArticle, type Audience } from './MetricArticle';

/**
 * The reference itself: a sticky index of every metric beside the entries.
 *
 * Shared by both audiences, because the figures, formulas, bands and limits are
 * the same on each. Only `audience` differs, and it decides whether an entry
 * also carries its producing file and its constant names.
 *
 * On a narrow screen the index comes first in the grid, which is deliberate: it
 * then reads as a table of contents rather than as a sidebar nobody can reach.
 */
export function MetricReference({
  audience,
  children,
}: {
  audience: Audience;
  /** Rendered after the last entry, inside the content column. */
  children?: ReactNode;
}) {
  const active = useActiveSection(METRIC_DOCS.map((doc) => doc.slug));

  return (
    <div className="grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <p className="label text-faint">Reference</p>
        <nav aria-label="Metrics" className="mt-4 space-y-6">
          {METRIC_GROUPS.map((group) => (
            <div key={group.key}>
              <p className="text-xs font-medium text-ink">{group.label}</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {metricsIn(group.key).map((doc) => (
                  <li key={doc.slug}>
                    <a
                      href={`#${doc.slug}`}
                      aria-current={active === doc.slug ? 'true' : undefined}
                      className={cn(
                        'block text-[13px] leading-snug transition-colors',
                        active === doc.slug ? 'text-primary' : 'text-muted hover:text-ink',
                      )}
                    >
                      {doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="max-w-2xl space-y-14">
        {METRIC_GROUPS.map((group) => (
          /* The group header already draws a rule, so the first entry under it
             drops its own. `first:` on the article itself cannot see past the
             header, which is why the variant lives here. */
          <section
            key={group.key}
            className="space-y-14 [&>article:first-of-type]:border-t-0 [&>article:first-of-type]:pt-0"
          >
            <header className="border-b border-border pb-5">
              <h2 className="label text-primary">{group.label}</h2>
              <p className="mt-2 text-sm text-muted">{group.blurb}</p>
            </header>
            {metricsIn(group.key).map((doc) => (
              <MetricArticle key={doc.slug} doc={doc} audience={audience} />
            ))}
          </section>
        ))}
        {children}
      </div>
    </div>
  );
}
