/**
 * QYNE site-wide content constants.
 * Content is hardcoded by design — no CMS. Edit here.
 */

export const SITE = {
  name: 'QYNE',
  legalName: 'QYNE Pvt Ltd',
  /** Canonical origin — single source of truth for absolute URLs (SEO, OG). */
  url: 'https://qyne.in',
  /** Absolute URL of the social share image (1200×630). */
  ogImage: 'https://qyne.in/og/qyne-og.png',
  tagline: 'If you have a body, you are an athlete. QYNE is the intelligence to train like one.',
  description:
    'QYNE turns wearable data, smartphone assessments and sport-specific skill analysis into a personalized, periodized training plan.',
  locations: 'Bangalore · India',
  email: 'support@qyne.one',
} as const

/**
 * URL of the QYNE app — the post-login dashboard, a SEPARATE deployment at
 * `app.<domain>`. This marketing site never authenticates and makes no backend
 * calls; "Log in" / "Sign up" hand off to the app, which owns the real OTP flow.
 *
 * Resolution order:
 *   1. `VITE_APP_URL` build var (set this in production, e.g. https://app.qyne.one).
 *   2. Derived from the current host for any `*.qyne.one` origin
 *      (staging.qyne.one → app.staging.qyne.one, qyne.one → app.qyne.one).
 *   3. Staging app, as a safe default for local dev and preview builds.
 */
export function appUrl(path = ''): string {
  const configured = (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/+$/, '')
  if (configured) return configured + path

  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'qyne.one' || host.endsWith('.qyne.one')) {
      return `https://app.${host.replace(/^app\./, '')}${path}`
    }
  }
  return `https://app.staging.qyne.one${path}`
}

/** Primary navigation — used by Nav and the demo CTA. */
export const NAV_LINKS = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Wearable', href: '/wearable' },
  { label: 'Assessments', href: '/assessments' },
  { label: 'Periodization', href: '/periodization' },
  { label: 'Skill assessment', href: '/cricket' },
] as const

/** Wearable brands QYNE ingests data from. */
export const WEARABLES = [
  'Garmin',
  'Apple Watch',
  'WHOOP',
  'Fitbit Air',
  'Mi Band',
  'Noise',
  'boAt',
  'Polar',
] as const

/** Footer link columns. */
export const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'The wearable', href: '/wearable' },
      { label: 'Assessments', href: '/assessments' },
      { label: 'Periodization', href: '/periodization' },
      { label: 'Skill assessment', href: '/cricket' },
      { label: 'Performance system', href: '/performance' },
      { label: 'Exercise library', href: '/exercise-library' },
      { label: 'Get the app', href: '/#app' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Team', href: '/about#team' },
      { label: 'Careers', href: '/about#careers' },
      { label: 'Press', href: '/about#press' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help centre', href: '/support' },
      { label: 'Status', href: '/support#status' },
      { label: 'Contact', href: 'mailto:support@qyne.one' },
      { label: 'Security report', href: '/security#disclosure' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Security', href: '/security' },
      { label: 'DPDP compliance', href: '/privacy#minors' },
    ],
  },
] as const

/** Role options for the demo request form. */
export const DEMO_ROLES = [
  'Academy owner',
  'Head coach',
  'Coach',
  'Other',
] as const
