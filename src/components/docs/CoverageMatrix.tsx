import { METRIC_DOCS, SOURCES, SUPPLY_LABELS, type Supply } from '../../data/metricDocs';

/**
 * Which source supplies which metric, and how.
 *
 * "Derived" is kept distinct from "measured" on purpose. A recovery score from
 * Health Connect is computed by us out of figures another app wrote; reading it
 * as a measurement from the platform is the misunderstanding this table exists
 * to prevent.
 */
const SUPPLY_MARK: Record<Supply, string> = {
  measured: 'border-primary bg-primary',
  derived: 'border-info bg-transparent',
  none: 'border-border bg-transparent',
};

function SupplyCell({ supply }: { supply: Supply }) {
  return (
    <td className="px-4 py-3 text-center">
      <span className="inline-flex items-center gap-2">
        <span aria-hidden className={`size-2.5 rounded-full border ${SUPPLY_MARK[supply]}`} />
        <span className="sr-only">{SUPPLY_LABELS[supply]}</span>
      </span>
    </td>
  );
}

export function CoverageMatrix() {
  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <caption className="sr-only">
            Every metric, and how each source supplies it: measured, derived, or not yet sent by
            anything
          </caption>
          <thead>
            <tr className="border-b border-border bg-surface">
              <th scope="col" className="label px-4 py-3 font-medium text-faint">
                Metric
              </th>
              {SOURCES.map((source) => (
                <th
                  key={source.key}
                  scope="col"
                  className="label px-4 py-3 text-center font-medium whitespace-nowrap text-faint"
                >
                  {source.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRIC_DOCS.map((doc) => (
              <tr key={doc.slug} className="border-b border-border/60 last:border-0">
                <th scope="row" className="px-4 py-3 font-normal">
                  {/* A plain anchor, like the legal pages: the sections are on
                      this page, and a hash jump should not need the router. */}
                  <a
                    href={`#${doc.slug}`}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {doc.name}
                  </a>
                </th>
                {SOURCES.map((source) => (
                  <SupplyCell key={source.key} supply={doc.supply[source.key]} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
        <li className="inline-flex items-center gap-2">
          <span aria-hidden className={`size-2.5 rounded-full border ${SUPPLY_MARK.measured}`} />
          Measured by the source
        </li>
        <li className="inline-flex items-center gap-2">
          <span aria-hidden className={`size-2.5 rounded-full border ${SUPPLY_MARK.derived}`} />
          Derived by QYNE from what the source measures
        </li>
        <li className="inline-flex items-center gap-2">
          <span aria-hidden className={`size-2.5 rounded-full border ${SUPPLY_MARK.none}`} />
          Nothing wired sends it yet
        </li>
      </ul>
    </div>
  );
}
