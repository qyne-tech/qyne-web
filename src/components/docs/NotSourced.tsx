import { METRIC_DOCS } from '../../data/metricDocs';

/**
 * Every constant the code itself flags as chosen rather than sourced.
 *
 * Collected from the entries rather than listed again here, so a constant
 * cannot appear in one place and not the other. This is the list to work
 * through when there is finally enough data to fit these properly: each one
 * decides what an athlete is told, and each one will move when it is fitted.
 */
export function NotSourced() {
  const rows = METRIC_DOCS.flatMap((doc) =>
    (doc.formula.constants ?? [])
      .filter((constant) => constant.provisional)
      .map((constant) => ({ doc, constant })),
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[42rem] border-collapse text-left">
        <caption className="sr-only">
          Constants the code flags as chosen, provisional or conventional rather than sourced
        </caption>
        <thead>
          <tr className="border-b border-border bg-surface">
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Constant
            </th>
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Value
            </th>
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Metric
            </th>
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Why it has that value
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ doc, constant }) => (
            <tr
              key={`${doc.slug}-${constant.symbol}`}
              className="border-b border-border/60 align-top last:border-0"
            >
              <th scope="row" className="px-4 py-3 font-mono text-xs font-normal text-ink">
                {constant.symbol}
              </th>
              <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-warning">
                {constant.value}
              </td>
              <td className="px-4 py-3 text-sm">
                <a
                  href={`#${doc.slug}`}
                  className="text-muted transition-colors hover:text-primary"
                >
                  {doc.name}
                </a>
              </td>
              <td className="px-4 py-3 text-sm text-muted">{constant.why}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
