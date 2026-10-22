import { formatRange, type BandRow } from '../../data/metricDocs';
import { toneColor } from './tone';

/**
 * A metric's bands, drawn as one continuous scale and listed as a table.
 *
 * Both halves read the same spans off each band, so the bar cannot disagree
 * with the table about where a band starts: the failure this page would be
 * least likely to notice and most likely to be quoted on.
 *
 * A band may hold more than one span. Respiratory rate's bands are two-sided,
 * where too slow and too fast are the same band, and drawing that as one block
 * across the middle of the scale would paint the healthy range as the worst.
 *
 * The bar carries no information the table does not, so it is hidden from
 * assistive technology rather than duplicated into it.
 *
 * Colours come from the service's band-colour config rather than from this
 * site's palette, so a band is the colour the athlete sees in the app.
 */
export function BandScale({ rows }: { rows: BandRow[] }) {
  const spans = rows.flatMap((band) => band.ranges.map((range) => ({ band, range })));
  const floor = Math.min(...spans.map((s) => s.range.from));
  const ceiling = Math.max(...spans.map((s) => s.range.to));
  const position = (value: number) => ((value - floor) / (ceiling - floor)) * 100;

  return (
    <div>
      <div aria-hidden>
        <div className="relative h-2.5 overflow-hidden rounded-sm bg-surface-2">
          {spans.map(({ band, range }) => (
            <span
              key={`${band.label}-${range.from}`}
              className="absolute inset-y-0"
              style={{
                backgroundColor: toneColor(band.tone),
                left: `${position(range.from)}%`,
                width: `${position(range.to) - position(range.from)}%`,
              }}
            />
          ))}
        </div>
        {/* Only the two ends are labelled. Every band boundary would collide on
            a narrow scale, and the table below prints each range in full. */}
        <div className="mt-2 flex justify-between font-mono text-[10px] text-faint">
          <span>{floor}</span>
          <span>{ceiling}</span>
        </div>
      </div>

      <table className="mt-4 w-full border-collapse text-left">
        <caption className="sr-only">Bands, and what each one means</caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="label py-2 pr-4 font-medium text-faint">
              Band
            </th>
            <th scope="col" className="label py-2 pr-4 font-medium text-faint">
              Range
            </th>
            <th scope="col" className="label py-2 font-medium text-faint">
              What it means
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((band) => (
            <tr key={band.label} className="border-b border-border/60 align-top last:border-0">
              <th scope="row" className="py-3 pr-4 font-normal whitespace-nowrap text-ink">
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: toneColor(band.tone) }}
                  />
                  {band.label}
                </span>
              </th>
              <td className="py-3 pr-4 font-mono text-xs whitespace-nowrap text-muted">
                {formatRange(band)}
              </td>
              <td className="py-3 text-sm text-muted">{band.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
