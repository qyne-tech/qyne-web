import { SOURCES } from '../../data/metricDocs';
import { DERIVED_OUTPUTS, PIPELINE, RAW_INPUTS } from '../../data/metricPipeline';

/**
 * What arrives from a source and what we compute, side by side.
 *
 * Two tables rather than one with a column, because the two halves do not
 * share a shape: a received reading has a wire name, a unit, accepted bounds
 * and a rollup; a computed figure has inputs and a producer. Forcing them into
 * one grid would leave half of every row empty.
 */
function Yes() {
  return (
    <>
      <span aria-hidden className="inline-block size-2.5 rounded-full bg-primary" />
      <span className="sr-only">Sends it</span>
    </>
  );
}

function No() {
  return (
    <>
      <span aria-hidden className="inline-block h-px w-2.5 bg-border" />
      <span className="sr-only">Does not send it</span>
    </>
  );
}

export function RawInputsTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[56rem] border-collapse text-left">
        <caption className="sr-only">
          Every reading received from a source as it arrives, with its stored name, unit, accepted
          range, rollup and which sources send it
        </caption>
        <thead>
          <tr className="border-b border-border bg-surface">
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Stored as
            </th>
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Unit
            </th>
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Accepted
            </th>
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Day rollup
            </th>
            {SOURCES.map((source) => (
              <th
                key={source.key}
                scope="col"
                className="label px-3 py-3 text-center font-medium whitespace-nowrap text-faint"
              >
                {source.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RAW_INPUTS.map((input) => (
            <tr key={input.wire} className="border-b border-border/60 align-top last:border-0">
              <th scope="row" className="px-4 py-4 font-normal">
                <span className="block font-mono text-xs text-primary">{input.wire}</span>
                <span className="mt-1 block text-sm text-ink">{input.label}</span>
                <span className="mt-1.5 block max-w-md text-xs leading-[1.6] text-muted">
                  {input.note}
                </span>
              </th>
              <td className="px-4 py-4 font-mono text-xs whitespace-nowrap text-muted">
                {input.unit}
              </td>
              <td className="px-4 py-4 font-mono text-xs text-muted">{input.accepted}</td>
              <td className="px-4 py-4 font-mono text-xs text-muted">{input.rollup}</td>
              {SOURCES.map((source) => (
                <td key={source.key} className="px-3 py-4 text-center">
                  {input.sources[source.key] ? <Yes /> : <No />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DerivedOutputsTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[42rem] border-collapse text-left">
        <caption className="sr-only">
          Every figure QYNE computes, its unit, what it is computed from, and where
        </caption>
        <thead>
          <tr className="border-b border-border bg-surface">
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Figure
            </th>
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Unit
            </th>
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Computed from
            </th>
            <th scope="col" className="label px-4 py-3 font-medium text-faint">
              Where
            </th>
          </tr>
        </thead>
        <tbody>
          {DERIVED_OUTPUTS.map((output) => (
            <tr key={output.name} className="border-b border-border/60 align-top last:border-0">
              <th scope="row" className="px-4 py-3 font-normal text-ink">
                {output.slug ? (
                  <a href={`#${output.slug}`} className="transition-colors hover:text-primary">
                    {output.name}
                  </a>
                ) : (
                  output.name
                )}
              </th>
              <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-muted">
                {output.unit}
              </td>
              <td className="px-4 py-3 text-sm text-muted">{output.inputs}</td>
              <td className="px-4 py-3 font-mono text-[11px] text-faint">{output.cite}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** What happens to a reading between a sensor and a screen, in order. */
export function PipelineList() {
  return (
    <ol className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
      {PIPELINE.map((stage, i) => (
        <li key={stage.title} className="bg-surface p-6">
          <span className="font-mono text-[11px] text-primary">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className="mt-2 text-[15px] font-medium text-ink">{stage.title}</h3>
          <p className="mt-2 text-sm leading-[1.7] text-muted">{stage.body}</p>
        </li>
      ))}
    </ol>
  );
}
