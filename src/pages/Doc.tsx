import { Section } from '../components/primitives/Container';
import { Eyebrow } from '../components/primitives/Eyebrow';
import { Seo } from '../components/primitives/Seo';
import { PageIntro } from '../components/sections/PageIntro';
import { CoverageMatrix } from '../components/docs/CoverageMatrix';
import { MetricReference } from '../components/docs/MetricReference';
import { QuickReference } from '../components/docs/QuickReference';
import { METRIC_DOCS, SOURCES } from '../data/metricDocs';

/**
 * The public metric reference.
 *
 * Every entry answers the same four questions in the same order (what the app
 * shows, how the figure is produced, what to read it against, and what it
 * cannot tell you), so the page can be scanned rather than read, and so a gap
 * in one metric's documentation is visible as a missing block.
 *
 * ## What this page does not soften
 *
 * It is the same arithmetic the server runs: the same weights, the same
 * constants, the same bands, and the same list of things each figure cannot
 * tell you. What it leaves out is the engineering layer, which is noise to an
 * athlete: the file that owns each formula and the constant names to grep for.
 * Those live on the internal page at /doc/internal, built from this same data.
 *
 * The content is in src/data/metricDocs.ts, transcribed from the service that
 * computes each figure. Adding a metric is a data change; nothing here switches
 * on a slug.
 */

/**
 * When the content was last checked against the service. A dated review note
 * goes visibly stale, which is the point: a documentation page that claims to
 * be current and is not is worse than one that says when it was written.
 */
const REVIEWED_ON = '22 October 2026';

/** How every entry is structured, explained once instead of per metric. */
const ENTRY_BLOCKS = [
  {
    title: 'What the app shows',
    body: 'The screen, the card and the chart a figure appears on, and what a multi-day window does to it.',
  },
  {
    title: 'How it is calculated',
    body: 'The formula as the server runs it, term by term, with every number in it and why it has that value. Where an equation says clamp, the result is held inside the range beside it.',
  },
  {
    title: 'What it is read against',
    body: 'Whether the scale is your own baseline or a general one, and whether it adjusts for age or sex.',
  },
  {
    title: 'What it cannot tell you',
    body: 'What the number is good for, and the things it is routinely assumed to prove and does not.',
  },
];

/** The three rules that decide what this page is allowed to claim. */
const PRINCIPLES = [
  {
    title: 'A figure we cannot compute says so',
    body: 'Where an input is missing, the app returns no number and a reason for it, never a zero, a sample value or a half-filled bar. A number on a health screen is indistinguishable from a measurement once it is drawn.',
  },
  {
    title: 'One producer per figure',
    body: 'Each number is computed in exactly one place, so two screens cannot disagree about the same reading. A different derivation is a different figure and carries a different name: a percentile against published norms and a percentile against other members never share a field.',
  },
  {
    title: 'Personal and general scales are labelled',
    body: 'Some figures are scored against your own trailing baseline and some against a published scale, and most of our bands adjust for neither age nor sex. Each entry says which, because the same 70 means two different things under the two.',
  },
];

export default function Doc() {
  return (
    <>
      <Seo
        title="Metric documentation — QYNE"
        description="How every QYNE metric is measured and calculated: sleep, recovery, strain, stress, energy, VO2 max, HRV, resting heart rate, zones, steps and calories, with the formulas, the bands and worked examples for the QYNE band, Health Connect and Apple Health."
        path="/doc"
      />

      <PageIntro
        eyebrow="Documentation"
        title="Every number, and where it comes from."
        subtitle="The formula behind each metric in the app, the scale it is read against, and the things it cannot tell you. Written for the athlete who wants to check the arithmetic."
      >
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 font-mono text-[11px] tracking-wide text-faint">
          <span>{METRIC_DOCS.length} metrics</span>
          <span>{SOURCES.length} sources</span>
          <span>Every formula published</span>
          <span>Reviewed: {REVIEWED_ON}</span>
        </div>
      </PageIntro>

      <Section className="border-b border-border">
        <Eyebrow>How to read an entry</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-balance text-[clamp(1.8rem,3vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.025em]">
          Four questions, asked of every metric in the same order.
        </h2>

        <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {ENTRY_BLOCKS.map((block, i) => (
            <li key={block.title} className="bg-surface p-6">
              <span className="font-mono text-[11px] text-primary">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 text-h3 text-ink">{block.title}</h3>
              <p className="mt-2 text-sm leading-[1.65] text-muted">{block.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
          <h2 className="text-h3 text-ink lg:sticky lg:top-28 lg:self-start">
            What this page will not do
          </h2>
          <dl className="max-w-2xl space-y-8">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="border-l border-border pl-5">
                <dt className="font-medium text-ink">{principle.title}</dt>
                <dd className="mt-2 text-[15px] leading-[1.72] text-muted">{principle.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section className="border-b border-border">
        <Eyebrow>Your devices</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-balance text-[clamp(1.8rem,3vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.025em]">
          Three places a reading can come from.
        </h2>
        <p className="mt-5 max-w-2xl text-[17px] leading-[1.6] text-muted">
          Where more than one source reports the same figure, one of them wins the whole chart
          rather than the readings being averaged together: the QYNE band whenever it has readings
          in the window, and otherwise whichever source has the most. Averaging two devices produces
          a number neither of them measured, and a line that changes source halfway is a chart of
          two different instruments.
        </p>

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {SOURCES.map((source) => (
            <li key={source.key} className="rounded-lg border border-border bg-surface p-6">
              <h3 className="text-h3 text-ink">{source.label}</h3>
              <p className="mt-2 text-sm leading-[1.65] text-muted">{source.note}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <h3 className="label text-faint">Measured, or worked out</h3>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.72] text-muted">
            Some of what you see is a reading stored exactly as your device sent it. The rest we
            calculate, from those readings and from your profile and history. The difference matters
            when a figure looks wrong: a measured reading is a question for the device, and a
            calculated one is a question for us. A row with no source at all is a figure the app is
            ready to show and nothing sends yet, listed rather than hidden.
          </p>
          <div className="mt-6">
            <CoverageMatrix />
          </div>
        </div>
      </Section>

      <Section className="border-b border-border">
        <Eyebrow>At a glance</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-balance text-[clamp(1.8rem,3vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.025em]">
          {METRIC_DOCS.length} metrics, and what each one is read against.
        </h2>
        <p className="mt-5 max-w-2xl text-[17px] leading-[1.6] text-muted">
          A general scale is the same table for every athlete, adjusted for neither age nor sex
          unless an entry says otherwise. Your own baseline means the figure is scored against your
          own history, so the same number means the same thing for each person.
        </p>
        <div className="mt-10">
          <QuickReference />
        </div>
      </Section>

      <Section id="reference">
        <MetricReference audience="public">
          <section className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-h3 text-ink">Not medical advice</h2>
            <p className="mt-3 text-[15px] leading-[1.72] text-muted">
              Everything on this page is a training tool. None of these figures is a diagnostic
              measurement, and no reading here should be used to decide whether to seek care. If a
              number looks wrong to you, it may well be: write to{' '}
              <a
                href="mailto:support@qyne.one"
                className="text-primary underline underline-offset-2 hover:text-primary-light"
              >
                support@qyne.one
              </a>{' '}
              and tell us which metric, which day and which device.
            </p>
          </section>
        </MetricReference>
      </Section>
    </>
  );
}
