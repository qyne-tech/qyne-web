import { motion, useReducedMotion } from 'framer-motion'
import { PulseRing } from '../animations/PulseRing'
import { cn } from '../../lib/utils'

/**
 * The QYNE motion pod — our in-house GPS + IMU module, drawn in SVG so it
 * stays crisp at any size and picks up the theme tokens (no render to ship).
 * Signal rings radiate from behind it; the status LED breathes.
 */
export function MotionPod({ className }: { className?: string }) {
  const reduced = useReducedMotion()

  return (
    <div className={cn('relative grid place-items-center', className)}>
      {/* Positioning signal, radiating outward from the pod. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[92%] max-w-[320px] -translate-x-1/2 -translate-y-1/2"
      >
        <PulseRing count={3} colorClass="border-primary/25" />
      </span>

      <svg
        viewBox="0 0 200 250"
        role="img"
        aria-label="The QYNE motion pod — an in-house GPS and IMU module worn between the shoulder blades"
        className="relative w-full max-w-[210px]"
      >
        <defs>
          {/* Enclosure shading, mixed from the surface tokens so the pod
              re-themes with the rest of the site. */}
          <linearGradient id="pod-body" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="color-mix(in srgb, var(--color-surface-2) 84%, var(--color-ink))" />
            <stop offset="0.5" stopColor="var(--color-surface)" />
            <stop offset="1" stopColor="var(--color-bg)" />
          </linearGradient>
          <linearGradient id="pod-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-ink)" stopOpacity="0.18" />
            <stop offset="0.45" stopColor="var(--color-ink)" stopOpacity="0.04" />
            <stop offset="1" stopColor="var(--color-ink)" stopOpacity="0.09" />
          </linearGradient>
          <radialGradient id="pod-led" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="var(--color-primary-light)" />
            <stop offset="1" stopColor="var(--color-primary)" />
          </radialGradient>
          <filter id="pod-led-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* Contact shadow, so the pod sits on the card rather than floating. */}
        <ellipse cx="100" cy="214" rx="52" ry="9" fill="#000" opacity="0.45" />

        {/* Enclosure */}
        <rect
          x="42"
          y="26"
          width="116"
          height="176"
          rx="34"
          fill="url(#pod-body)"
          stroke="url(#pod-edge)"
          strokeWidth="1.5"
        />
        {/* Inner bevel line — reads as the seam between the two shells. */}
        <rect
          x="49"
          y="33"
          width="102"
          height="162"
          rx="28"
          fill="none"
          stroke="var(--color-ink)"
          strokeOpacity="0.06"
        />

        {/* Wordmark */}
        <text
          x="100"
          y="112"
          textAnchor="middle"
          className="fill-ink text-[17px] font-medium"
          style={{ letterSpacing: '0.06em' }}
        >
          QYNE
        </text>

        {/* Status LED */}
        <motion.g
          animate={reduced ? undefined : { opacity: [1, 0.4, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle
            cx="100"
            cy="163"
            r="6"
            fill="var(--color-primary)"
            filter="url(#pod-led-glow)"
          />
          <circle cx="100" cy="163" r="4.5" fill="url(#pod-led)" />
        </motion.g>
      </svg>
    </div>
  )
}
