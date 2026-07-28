import { Link } from 'react-router-dom'
import { appUrl } from '../lib/site'
import { buttonVariants } from '../components/primitives/Button'
import { PageIntro } from '../components/sections/PageIntro'
import { PlatformData } from '../components/sections/PlatformData'
import { Wearable as QYNEBand } from '../components/sections/Wearable'
import { CTA } from '../components/sections/CTA'
import { Seo } from '../components/primitives/Seo'
import { cn } from '../lib/utils'

/**
 * The full wearable story, told in order:
 *   1. PageIntro — what the wearable layer is
 *   2. PlatformData — how the flow works, then the bands we connect to
 *   3. QYNEBand — for athletes without a wearable, the QYNE band + its sensors
 *   4. CTA
 */
export default function WearablePage() {
  return (
    <>
      <Seo
        title="The wearable — QYNE | Connect any band, or wear ours"
        description="QYNE works with the wearables you already own — WHOOP, Apple Watch, Garmin, Oura and more — auto-syncing your signals into one periodization engine. No band yet? Meet the screenless QYNE band."
        path="/wearable"
      />

      <PageIntro
        eyebrow="The wearable"
        title="Connect any band. Or wear ours."
        subtitle="QYNE turns the wearable you already own into training intelligence — and if you don’t have one, the screenless QYNE band measures everything that matters."
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

      {/* Flow → the bands we connect to → why it matters → data trust */}
      <PlatformData />

      {/* The QYNE band, for athletes who don't already own a wearable */}
      <QYNEBand />

      <CTA />
    </>
  )
}
