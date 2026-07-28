import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { appUrl } from '../lib/site'
import type { LucideIcon } from 'lucide-react'
import { Video, ScanLine, BarChart3, BrainCircuit, ChevronRight } from 'lucide-react'
import { Section } from '../components/primitives/Container'
import { buttonVariants } from '../components/primitives/Button'
import { PageIntro } from '../components/sections/PageIntro'
import { Assessments as AssessmentGrid } from '../components/sections/Assessments'
import { CTA } from '../components/sections/CTA'
import { Seo } from '../components/primitives/Seo'
import { ScrollReveal } from '../components/animations/ScrollReveal'
import { cn } from '../lib/utils'

// The core loop: a phone video becomes objective data that drives the plan.
const FLOW: { icon: LucideIcon; name: string }[] = [
  { icon: Video, name: 'Record on your phone' },
  { icon: ScanLine, name: 'Computer-vision analysis' },
  { icon: BarChart3, name: 'Objective metrics' },
  { icon: BrainCircuit, name: 'Periodization engine' },
]

export default function AssessmentsPage() {
  return (
    <>
      <Seo
        title="Assessments — QYNE | Lab-grade testing from a smartphone"
        description="Jump, sprint, barbell-velocity, running and mobility tests measured from a single phone video — real, objective metrics with no extra equipment, fed straight into QYNE's periodization engine."
        path="/assessments"
      />

      <PageIntro
        eyebrow="Assessments"
        title="Lab-grade testing, from a smartphone."
        subtitle="Advanced performance assessments with real, objective metrics — no force plates, no lab. Every test feeds straight into the periodization engine, so your plan is built on data, not guesswork."
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <a href={appUrl('/signup')} className={cn(buttonVariants({ size: 'lg' }))}>
            Get started
          </a>
          <Link
            to="/how-it-works"
            className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }))}
          >
            See how it works
          </Link>
        </div>
      </PageIntro>

      {/* Core purpose — turn a phone video into data the engine can act on */}
      <Section className="border-t border-border bg-surface">
        <span className="label text-faint">From video to plan</span>
        <ScrollReveal className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-3">
          {FLOW.map((s, i) => (
            <Fragment key={s.name}>
              <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg px-3.5 py-2.5">
                <s.icon size={16} className="text-primary" />
                <span className="text-[13px] text-ink">{s.name}</span>
              </span>
              {i < FLOW.length - 1 && (
                <ChevronRight size={15} className="shrink-0 text-faint" />
              )}
            </Fragment>
          ))}
        </ScrollReveal>
        <p className="mt-6 max-w-2xl text-[15px] leading-[1.6] text-muted">
          No extra hardware to buy and nothing to calibrate — point the camera,
          run the test, and QYNE turns the footage into the same numbers a
          performance lab would, then routes them into your periodized plan.
        </p>
      </Section>

      {/* The full test library */}
      <AssessmentGrid />

      <CTA />
    </>
  )
}
