import { Link } from 'react-router-dom';
import { Section } from '../components/primitives/Container';
import { Eyebrow } from '../components/primitives/Eyebrow';
import { Seo } from '../components/primitives/Seo';
import { PageIntro } from '../components/sections/PageIntro';
import { CoverageMatrix } from '../components/docs/CoverageMatrix';
import { MetricReference } from '../components/docs/MetricReference';
import { NotSourced } from '../components/docs/NotSourced';
import { DerivedOutputsTable, PipelineList, RawInputsTable } from '../components/docs/Provenance';
import { METRIC_DOCS } from '../data/metricDocs';
import { CODE_MAP, DERIVED_OUTPUTS, RAW_INPUTS } from '../data/metricPipeline';

/**
 * The internal metric reference: the same figures, down to the file.
 *
 * Built from the same data as /doc, with `audience="internal"`, so the two
 * cannot disagree about a formula. What this page adds is everything an
 * engineer needs and an athlete does not: the producing file for every figure,
 * the constant names to grep for, the canonical wire names and ingest bounds,
 * the full path from sensor to screen, and the list of constants the code
 * itself admits were chosen rather than fitted.
 *
 * Not indexed, and not linked from the footer. It is not secret: there is
 * nothing here an athlete should not be able to read, which is the test every
 * line of it has to pass.
 */
const REVIEWED_ON = '22 October 2026';

export default function DocInternal() {
  const constants = METRIC_DOCS.reduce(
    (total, doc) => total + (doc.formula.constants?.length ?? 0),
    0,
  );

  return (
    <>
      <Seo
        title="Metric implementation reference — QYNE internal"
        description="Internal engineering reference for every QYNE metric: producing file, formula, constants, canonical ingest names and bounds, source coverage and the path from sensor to screen."
        path="/doc/internal"
        noindex
      />

      <PageIntro
        eyebrow="Internal"
        title="Every metric, down to the file."
        subtitle="The same arithmetic the public page publishes, with the engineering layer on top: what produces each figure, what it is named on the wire, what it is bounded by, and which of its constants nobody has fitted yet."
      >
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 font-mono text-[11px] tracking-wide text-faint">
          <span>{METRIC_DOCS.length} metrics</span>
          <span>{RAW_INPUTS.length} received readings</span>
          <span>{DERIVED_OUTPUTS.length} computed figures</span>
          <span>{constants} documented constants</span>
          <span>Reviewed: {REVIEWED_ON}</span>
        </div>
      </PageIntro>

      <Section className="border-b border-border">
        <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
          <h2 className="text-h3 text-ink lg:sticky lg:top-28 lg:self-start">
            Before you change a metric
          </h2>
          <div className="max-w-2xl space-y-8">
            <div className="border-l border-primary pl-5">
              <h3 className="font-medium text-ink">Update the documentation in the same change</h3>
              <p className="mt-2 text-[15px] leading-[1.72] text-muted">
                Touching a figure, a weight, a threshold, a band, a unit or an empty state means
                updating its entry here in the same pull request. Both pages are built from{' '}
                <span className="font-mono text-xs text-ink">qyne-web src/data/metricDocs.ts</span>{' '}
                and <span className="font-mono text-xs text-ink">src/data/metricPipeline.ts</span>,
                so there is one edit to make and no second copy to drift. This is a review gate in
                the org standards, not a convention.
              </p>
            </div>
            <div className="border-l border-border pl-5">
              <h3 className="font-medium text-ink">Read the decision first</h3>
              <p className="mt-2 text-[15px] leading-[1.72] text-muted">
                One producer per figure, and a different derivation is a different figure with a
                different name. A figure you cannot compute returns null with a stated reason, never
                a zero and never a sample. Both are decisions already taken, in{' '}
                <span className="font-mono text-xs text-ink">qyne-service docs/decisions/</span>.
              </p>
            </div>
            <div className="border-l border-border pl-5">
              <h3 className="font-medium text-ink">The public page is the same data</h3>
              <p className="mt-2 text-[15px] leading-[1.72] text-muted">
                <Link to="/doc" className="text-primary underline underline-offset-2">
                  /doc
                </Link>{' '}
                renders these entries without the file paths and constant names. Nothing is softened
                for it, so a limitation you would not want published is a limitation to fix rather
                than to omit.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="border-b border-border">
        <Eyebrow>Where it lives</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-balance text-[clamp(1.8rem,3vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.025em]">
          The map before the change.
        </h2>
        <div className="mt-10 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[44rem] border-collapse text-left">
            <caption className="sr-only">
              Which repository and path owns each part of the metric pipeline
            </caption>
            <thead>
              <tr className="border-b border-border bg-surface">
                <th scope="col" className="label px-4 py-3 font-medium text-faint">
                  Area
                </th>
                <th scope="col" className="label px-4 py-3 font-medium text-faint">
                  Path
                </th>
                <th scope="col" className="label px-4 py-3 font-medium text-faint">
                  What is in it
                </th>
              </tr>
            </thead>
            <tbody>
              {CODE_MAP.map((row) => (
                <tr key={row.area} className="border-b border-border/60 align-top last:border-0">
                  <th scope="row" className="px-4 py-3 font-normal whitespace-nowrap text-ink">
                    {row.area}
                  </th>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{row.path}</td>
                  <td className="px-4 py-3 text-sm text-muted">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="provenance" className="border-b border-border">
        <Eyebrow>Received and computed</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-balance text-[clamp(1.8rem,3vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.025em]">
          What a device measured, and what we worked out.
        </h2>
        <p className="mt-5 max-w-2xl text-[17px] leading-[1.6] text-muted">
          The per-source columns below come from what the app actually uploads, which is not the
          same as what a platform holds: Health Connect has a respiratory-rate record and we have
          never asked for it. A table built from platform capabilities would say we had it.
        </p>

        <div className="mt-12">
          <h3 className="label text-faint">Received as-is from a source</h3>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.72] text-muted">
            Stored under the name in the first column, in the unit beside it, after being checked
            against the accepted range. Two names exist only because one name once meant two things:
            a cumulative day total against a per-interval delta, and a source’s own resting heart
            rate against a raw stream.
          </p>
          <div className="mt-6">
            <RawInputsTable />
          </div>
        </div>

        <div className="mt-14">
          <h3 className="label text-faint">Computed by QYNE</h3>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.72] text-muted">
            Nothing here arrives from a device. Each figure is produced by one function, in one
            place, from the inputs named beside it.
          </p>
          <div className="mt-6">
            <DerivedOutputsTable />
          </div>
        </div>

        <div className="mt-14">
          <h3 className="label text-faint">Metric by metric</h3>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.72] text-muted">
            The same split, read the other way round.
          </p>
          <div className="mt-6">
            <CoverageMatrix />
          </div>
        </div>
      </Section>

      <Section className="border-b border-border">
        <Eyebrow>From sensor to screen</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-balance text-[clamp(1.8rem,3vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.025em]">
          Everything that happens to a reading on the way.
        </h2>
        <p className="mt-5 max-w-2xl text-[17px] leading-[1.6] text-muted">
          In order, and every step is somewhere a number can legitimately change or disappear. Most
          of the rules below exist because the absence of one produced a figure that looked fine and
          was not.
        </p>
        <div className="mt-10">
          <PipelineList />
        </div>
      </Section>

      <Section className="border-b border-border">
        <Eyebrow>Chosen, not sourced</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-balance text-[clamp(1.8rem,3vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.025em]">
          The constants nobody has fitted yet.
        </h2>
        <p className="mt-5 max-w-2xl text-[17px] leading-[1.6] text-muted">
          Each one decides what an athlete is told, and each one is a judgement, a convention, or a
          value fitted against too little data. They are collected from the entries rather than
          retyped, so this list cannot fall out of step with them. This is the work queue for the
          first real training dataset.
        </p>
        <div className="mt-10">
          <NotSourced />
        </div>
      </Section>

      <Section id="reference">
        <MetricReference audience="internal">
          <section className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-h3 text-ink">Keeping this true</h2>
            <p className="mt-3 text-[15px] leading-[1.72] text-muted">
              Every band, weight, equation and bound above is transcribed from the file cited under
              it. When one moves, the citation is what to grep for, and the entry is what to edit in
              the same pull request. A documentation page that is quietly wrong is worse than none:
              it is the page somebody quotes in a support ticket.
            </p>
          </section>
        </MetricReference>
      </Section>
    </>
  );
}
