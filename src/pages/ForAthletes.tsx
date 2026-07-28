import { Link } from 'react-router-dom'
import { appUrl } from '../lib/site'
import type { LucideIcon } from 'lucide-react'
import { Gauge, Smartphone, BrainCircuit, Target, Moon, ShieldCheck } from 'lucide-react'
import { Section } from '../components/primitives/Container'
import { SectionHeading } from '../components/primitives/SectionHeading'
import { buttonVariants } from '../components/primitives/Button'
import { Stagger } from '../components/animations/ScrollReveal'
import { PageIntro } from '../components/sections/PageIntro'
import { CTA } from '../components/sections/CTA'
import { Seo } from '../components/primitives/Seo'
import { cn } from '../lib/utils'

const VALUE: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Gauge,
    title: 'Know if you’re ready',
    body: 'Wake up to a recovery score from your wearable — or a 30-second check-in if you don’t have one. Push on green days, hold on red.',
  },
  {
    icon: Smartphone,
    title: 'Lab-grade tests, no lab',
    body: 'Jump, sprint, strength and cricket biomechanics — measured from your phone. Real numbers, tracked over time.',
  },
  {
    icon: BrainCircuit,
    title: 'A plan that adapts to you',
    body: 'The periodization engine turns your data into a weekly plan that changes as your readiness and workload change.',
  },
  {
    icon: Target,
    title: 'Skill, periodized',
    body: 'Bowling and batting work that builds technique first, then sharpens it for match day — re-assessed every few weeks.',
  },
  {
    icon: Moon,
    title: 'Recovery & nutrition',
    body: 'Sleep, fueling and recovery guidance that moves with your training load, built around what you can actually eat.',
  },
  {
    icon: ShieldCheck,
    title: 'Your data, your control',
    body: 'Encrypted, never sold, exportable anytime — with verifiable parental consent for athletes under 18.',
  },
]

export default function ForAthletes() {
  return (
    <>
      <Seo
        title="For athletes — QYNE"
        description="Train like a professional: daily readiness, lab-grade smartphone assessments, a periodized plan that adapts to you, and recovery built around your life."
        path="/for-athletes"
      />

      <PageIntro
        eyebrow="For athletes"
        title="Train like a professional."
        subtitle="The intelligence pro setups take for granted — readiness, testing, periodization and recovery — in your pocket, built for cricket."
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <a href={appUrl('/signup')} className={cn(buttonVariants({ size: 'lg' }))}>
            Get started
          </a>
          <Link to="/how-it-works" className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }))}>
            See how it works
          </Link>
        </div>
      </PageIntro>

      <Section className="border-t border-border">
        <SectionHeading
          eyebrow="What you get"
          title="Everything a serious athlete needs, in one app."
        />
        <Stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {VALUE.map((v) => (
            <Stagger.Item key={v.title} className="h-full">
              <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-faint">
                <span className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface-2">
                  <v.icon size={18} className="text-primary" />
                </span>
                <h3 className="mt-5 text-[1.05rem] font-medium tracking-tight text-ink">{v.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.6] text-muted">{v.body}</p>
              </div>
            </Stagger.Item>
          ))}
        </Stagger>
      </Section>

      <CTA />
    </>
  )
}
