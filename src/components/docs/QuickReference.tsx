import { METRIC_DOCS, SOURCES, type MetricDoc } from '../../data/metricDocs';

/**
 * Every metric on one screen: unit, where it comes from, and what scale it is
 * read against.
 *
 * The scale column is the one worth scanning. "Your own baseline" and "A
 * general scale" are very different claims about the same kind of number, and
 * an athlete comparing their 70 with a friend's deserves to see which they are
 * looking at before reading any further.
 */
function scaleOf(doc: MetricDoc): string {
  if (!doc.bands) return 'No bands';
  return doc.bands.basis === 'personal' ? 'Your own baseline' : 'A general scale';
}

function originOf(doc: MetricDoc): string {
  const values = SOURCES.map((source) => doc.supply[source.key]);
  if (values.every((v) => v === 'none')) return 'No source yet';
  if (values.every((v) => v === 'derived')) return 'Calculated by QYNE';
  if (values.every((v) => v === 'measured')) return 'Measured by your device';
  return 'Measured where your device reports it, otherwise calculated';
}

export function QuickReference() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[40rem] border-collapse text-left">
        <caption className="sr-only">
          Every metric, its unit, where it comes from and the scale it is read against
        </caption>
        <thead>
          <tr className="border-b border-border bg-surface">
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Metric
            </th>
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Unit
            </th>
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Where it comes from
            </th>
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Read against
            </th>
          </tr>
        </thead>
        <tbody>
          {METRIC_DOCS.map((doc) => (
            <tr key={doc.slug} className="border-b border-border/60 last:border-0">
              <th scope="row" className="px-4 py-3 font-normal">
                <a
                  href={`#${doc.slug}`}
                  className="text-sm text-ink transition-colors hover:text-primary"
                >
                  {doc.name}
                </a>
              </th>
              <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-muted">
                {doc.unit}
              </td>
              <td className="px-4 py-3 text-sm text-muted">{originOf(doc)}</td>
              <td className="px-4 py-3 text-sm text-muted">{scaleOf(doc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
