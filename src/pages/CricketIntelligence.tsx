import { Link } from 'react-router-dom'
import { appUrl } from '../lib/site'
import { buttonVariants } from '../components/primitives/Button'
import { PageIntro } from '../components/sections/PageIntro'
import { SportGrid } from '../components/sections/SportGrid'
import { CricketIntelligence as CricketAnalyses } from '../components/sections/CricketIntelligence'
import { CTA } from '../components/sections/CTA'
import { Seo } from '../components/primitives/Seo'
import { cn } from '../lib/utils'

/**
 * The full skill-assessment story:
 *   1. PageIntro — skill-based, multi-sport, video-powered
 *   2. SportGrid — the sports we cover (Cricket live as Phase 1)
 *   3. CricketAnalyses — Phase 1 in depth (bowling, tracking, comparison, batting)
 *   4. CTA
 */
export default function CricketIntelligencePage() {
  return (
    <>
      <Seo
        title="Skill-based assessment — QYNE | Sport-specific biomechanics from video"
        description="Expert-built, video-powered skill assessment across sports. Cricket is live now as Phase 1 — bowling biomechanics, ball tracking, batting mechanics and athlete comparison, all from a single phone video."
        path="/cricket"
      />

      <PageIntro
        eyebrow="Skill-based assessment"
        title="Skill assessment for every sport."
        subtitle="Sport-specific. Expert-built. Video-powered. A single phone video becomes objective skill data — all feeding one periodized plan. Cricket is live now as Phase 1, with more sports rolling out."
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

      <SportGrid />

      <CricketAnalyses />

      <CTA />
    </>
  )
}
