import type { ReactNode } from 'react';
import { SOURCES, SUPPLY_LABELS, type MetricDoc } from '../../data/metricDocs';
import { BandScale } from './BandScale';
import { LineFigure } from './LineFigure';
import { toneColor } from './tone';

/** One labelled block inside an entry. */
function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h3 className="label text-faint">{title}</h3>
      <div className="mt-4 space-y-3 text-[15px] leading-[1.72] text-muted">{children}</div>
    </section>
  );
}

/**
 * One equation, as written in the service.
 *
 * Scrolls inside itself rather than wrapping: a formula broken across two
 * lines at an arbitrary character reads as two formulas.
 */
function Equation({ children }: { children: string }) {
  return (
    <p className="overflow-x-auto rounded-lg border border-border bg-surface-2 px-4 py-3 font-mono text-[13px] leading-relaxed whitespace-nowrap text-ink">
      {children}
    </p>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 pl-5">
      {items.map((item) => (
        <li key={item} className="list-disc marker:text-faint">
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Who the entry is being rendered for.
 *
 * The figures, formulas, bands and limits are identical in both: a public page
 * that softened any of them would be the dishonest kind of documentation. What
 * the internal audience gets on top is the engineering layer, which is noise to
 * an athlete and the whole point to us: the file that owns each formula, the
 * constant names to grep for, and which values are chosen rather than sourced.
 */
export type Audience = 'public' | 'internal';

/**
 * A single metric entry: what the app shows, how the figure is produced, what
 * to read it against, and what it cannot tell you, in that order, for every
 * metric, so the page can be scanned down one column rather than read.
 *
 * Deliberately no scroll-triggered reveal. This is reference material someone
 * lands on mid-page from a link or a search result, and content that starts at
 * zero opacity is content that is missing whenever the animation does not run.
 */
export function MetricArticle({
  doc,
  audience = 'public',
}: {
  doc: MetricDoc;
  audience?: Audience;
}) {
  const internal = audience === 'internal';
  return (
    <article
      id={doc.slug}
      className="scroll-mt-28 border-t border-border pt-14 first:border-t-0 first:pt-0"
    >
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[1.6rem] font-medium tracking-tight text-ink">{doc.name}</h2>
          <span className="rounded-sm border border-border bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">
            {doc.unit}
          </span>
        </div>
        <p className="mt-3 text-[17px] leading-[1.6] text-ink/90">{doc.summary}</p>
      </header>

      <Block title="What the app shows">
        <Bullets items={doc.shown} />
      </Block>

      <Block title="How it is calculated">
        {doc.formula.expression && <Equation>{doc.formula.expression}</Equation>}

        {doc.formula.terms && (
          <dl className="space-y-4 border-l border-border pl-4">
            {doc.formula.terms.map((term) => (
              <div key={term.name}>
                <dt className="text-[13px] font-medium text-ink">{term.name}</dt>
                <dd className="mt-1.5">
                  <Equation>{term.expression}</Equation>
                  {term.note && <p className="mt-1.5 text-sm text-muted">{term.note}</p>}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <Bullets items={doc.formula.steps} />

        {doc.formula.constants && (
          <table className="w-full border-collapse text-left">
            <caption className="label pt-2 pb-3 text-faint">
              Every number above, and why it has that value
            </caption>
            <tbody>
              {doc.formula.constants.map((constant) => (
                <tr key={constant.symbol} className="border-t border-border/60 align-top">
                  {internal && (
                    <th
                      scope="row"
                      className="w-[30%] py-3 pr-4 font-mono text-xs font-normal text-ink"
                    >
                      {constant.symbol}
                      {constant.provisional && (
                        <span className="mt-1 block text-[10px] tracking-wide text-warning">
                          chosen, not sourced
                        </span>
                      )}
                    </th>
                  )}
                  <td className="py-3 pr-4 font-mono text-xs whitespace-nowrap text-primary">
                    {constant.value}
                  </td>
                  <td className="py-3 text-sm text-muted">{constant.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {internal && (
          <p className="font-mono text-[11px] tracking-wide text-faint">
            Produced in {doc.formula.cite}
          </p>
        )}
      </Block>

      <Block title="Age, sex and personal factors">
        <dl className="space-y-3">
          <div className="sm:flex sm:gap-4">
            <dt className="shrink-0 font-mono text-[11px] tracking-wide text-faint sm:w-36 sm:pt-1">
              The figure varies with
            </dt>
            <dd className="mt-1 sm:mt-0">{doc.dependsOn.figure}</dd>
          </div>
          <div className="sm:flex sm:gap-4">
            <dt className="shrink-0 font-mono text-[11px] tracking-wide text-faint sm:w-36 sm:pt-1">
              The bands adjust for
            </dt>
            <dd className="mt-1 sm:mt-0">{doc.dependsOn.bands}</dd>
          </div>
        </dl>
      </Block>

      {doc.bands && (
        <Block title="Benchmarking">
          <p>
            <span className="text-ink">
              {doc.bands.basis === 'personal'
                ? 'Scored against your own baseline.'
                : 'A general scale, the same for everybody.'}
            </span>{' '}
            {doc.bands.note}
          </p>
          <BandScale rows={doc.bands.rows} />
        </Block>
      )}

      {doc.swatches && (
        <Block title="Colours">
          <p>{doc.swatches.note}</p>
          <ul className="space-y-2.5">
            {doc.swatches.rows.map((row) => (
              <li key={row.label} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-1.5 size-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: toneColor(row.tone) }}
                />
                <span>
                  <span className="text-ink">{row.label}</span>
                  <span className="text-muted"> {row.meaning}</span>
                </span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {doc.figure && <LineFigure figure={doc.figure} />}

      {doc.example && (
        <Block title="Worked example">
          <p className="text-ink">{doc.example.title}</p>
          <ol className="space-y-2 rounded-lg border border-border bg-surface px-4 py-4 font-mono text-[12.5px] leading-[1.7] text-muted">
            {doc.example.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </Block>
      )}

      <Block title="Why it matters">
        <p>{doc.significance.why}</p>
      </Block>

      <Block title="What it cannot tell you">
        <Bullets items={doc.significance.limits} />
      </Block>

      <footer className="mt-8 flex flex-wrap gap-2">
        {SOURCES.map((source) => {
          const supply = doc.supply[source.key];
          return (
            <span
              key={source.key}
              className={
                supply === 'none'
                  ? 'rounded-sm border border-border px-2.5 py-1 text-xs text-faint line-through'
                  : 'rounded-sm border border-border bg-surface px-2.5 py-1 text-xs text-muted'
              }
            >
              {source.label}
              <span className="text-faint"> · {SUPPLY_LABELS[supply]}</span>
            </span>
          );
        })}
      </footer>
    </article>
  );
}
