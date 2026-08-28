import type { LucideIcon } from 'lucide-react'
import {
  Gauge,
  TrendingUp,
  TrendingDown,
  RotateCw,
  Route,
  Satellite,
  Cpu,
  MapPin,
  Activity,
  ChartColumn,
  Brain,
  CalendarRange,
} from 'lucide-react'
import { Section } from '../primitives/Container'
import { SectionHeading } from '../primitives/SectionHeading'
import { ScrollReveal, Stagger } from '../animations/ScrollReveal'
import { MotionPod } from '../visuals/MotionPod'

interface Measure {
  icon: LucideIcon
  name: string
  body: string
  color: string
}

/** What the pod reads off the field, straight from the raw motion stream. */
const MEASURES: Measure[] = [
  { icon: Gauge, name: 'Speed', body: 'Top and average speed, every sprint.', color: 'var(--color-primary)' },
  { icon: TrendingUp, name: 'Acceleration', body: 'Every burst out of a standing start.', color: 'var(--color-warning)' },
  { icon: TrendingDown, name: 'Deceleration', body: 'Braking load — where injuries hide.', color: 'var(--color-danger)' },
  { icon: RotateCw, name: 'Rotation', body: 'Trunk and shoulder rotation, in 9 axes.', color: 'var(--color-accent)' },
  { icon: Route, name: 'Distance', body: 'Total and high-intensity distance covered.', color: 'var(--color-info)' },
]

/** The hardware story — kept to the three specs that actually matter. */
const SPECS: { icon: LucideIcon; label: string; body: string }[] = [
  {
    icon: Satellite,
    label: '10–20 Hz GPS',
    body: 'High-accuracy positioning, sampled up to twenty times a second.',
  },
  {
    icon: Cpu,
    label: '9-axis IMU',
    body: 'Accelerometer, gyroscope and magnetometer, fused on-device.',
  },
  {
    icon: MapPin,
    label: 'Worn between the scapula',
    body: 'Sits on the upper back — closest to the body’s centre of motion.',
  },
]

/** Raw motion in, an adapted training block out. */
const PIPELINE: { icon: LucideIcon; step: string; body: string }[] = [
  { icon: Activity, step: 'Measure', body: 'Every movement' },
  { icon: ChartColumn, step: 'Quantify', body: 'Skill intensity' },
  { icon: Brain, step: 'Analyze', body: 'AI insights' },
  { icon: CalendarRange, step: 'Adapt', body: 'Smarter training' },
]

/**
 * The GPS layer: QYNE's own motion pod. Sits alongside the band — the band
 * reads the body at rest and in recovery, the pod reads it in motion.
 */
export function MotionIntelligence() {
  return (
    <Section id="gps" className="border-t border-border">
      <SectionHeading
        eyebrow="Motion intelligence"
        title={
          <>
            Our own GPS module. <span className="text-primary">Built in India.</span>
          </>
        }
        description="Wearables tell you how ready the body is. The QYNE pod tells you what it actually did on the field — a high-accuracy GPS receiver paired with a 9-axis IMU, engineered in-house, worn between the shoulder blades."
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* The device + its specs */}
        <ScrollReveal className="flex flex-col">
          <div className="relative flex-1 overflow-hidden rounded-xl border border-border bg-bg px-4 py-10">
            <span aria-hidden className="pointer-events-none absolute inset-0 grid-bg mask-fade opacity-60" />
            <MotionPod className="relative" />
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {SPECS.map((s) => (
              <div
                key={s.label}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface px-3.5 py-3"
              >
                <s.icon size={17} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <div className="text-[14px] font-medium tracking-tight text-ink">{s.label}</div>
                  <p className="mt-0.5 text-[13px] leading-[1.5] text-muted">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* What it measures, and where the hardware comes from */}
        <div className="flex flex-col">
          <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MEASURES.map((m) => (
              <Stagger.Item key={m.name} className="h-full">
                <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-faint">
                  <m.icon size={20} style={{ color: m.color }} />
                  <h4 className="mt-3.5 text-[15px] font-medium tracking-tight text-ink">
                    {m.name}
                  </h4>
                  <p className="mt-1 text-[13px] leading-[1.5] text-muted">{m.body}</p>
                </div>
              </Stagger.Item>
            ))}
          </Stagger>

          <ScrollReveal delay={0.1} className="mt-3">
            <div className="rounded-lg border border-primary/25 bg-primary-bg p-5">
              <span className="label text-primary">Made in India</span>
              <h3 className="mt-3 text-[17px] font-medium tracking-tight text-ink">
                We’re building the module ourselves — antenna to firmware.
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-muted">
                Athlete-tracking hardware is imported, expensive and locked to its own
                software. So we’re designing and building our own in India: the antenna,
                the sensor-fusion firmware and the enclosure, tuned for super-high accuracy
                and priced for the academies and athletes who need it here.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Raw motion → an adapted plan */}
      <ScrollReveal delay={0.1} className="mt-12">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((p) => (
            <div key={p.step} className="flex items-center gap-3.5 bg-surface px-5 py-5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-surface-2">
                <p.icon size={17} className="text-primary" />
              </span>
              <div>
                <div className="text-[15px] font-medium tracking-tight text-ink">{p.step}</div>
                <p className="mt-0.5 text-[13px] leading-[1.5] text-muted">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </Section>
  )
}
