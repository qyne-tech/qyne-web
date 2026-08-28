import { Hero } from '../components/sections/Hero'
import { Problem } from '../components/sections/Problem'
import { WearableSummary } from '../components/sections/WearableSummary'
import { MotionIntelligence } from '../components/sections/MotionIntelligence'
import { HealthTrends } from '../components/sections/HealthTrends'
import { PeriodizationEngine } from '../components/sections/PeriodizationEngine'
import { AssessmentsSummary } from '../components/sections/AssessmentsSummary'
import { SkillAssessment } from '../components/sections/SkillAssessment'
import { PerformanceSummary } from '../components/sections/PerformanceSummary'
import { ExerciseLibrarySummary } from '../components/sections/ExerciseLibrarySummary'
import { AppLaunch } from '../components/sections/AppLaunch'
import { AcademiesPreview } from '../components/sections/AcademiesPreview'
import { Credibility } from '../components/sections/Credibility'
import { CTA } from '../components/sections/CTA'
import { Seo } from '../components/primitives/Seo'
import { useScrollSnap } from '../hooks/useScrollSnap'

export default function Home() {
  // Snap each landing section to the top as the scroll settles.
  useScrollSnap('#main > section')

  return (
    <>
      <Seo
        title="QYNE — If you have a body, you are an athlete. QYNE is the intelligence to train like one"
        description="QYNE fuses a screenless wearable, lab-grade smartphone assessments and sport-specific skill analysis into one periodization engine — the ultimate mind for the athletic body."
        path="/"
      />
      <Hero />
      <Problem />
      <WearableSummary />
      <MotionIntelligence />
      <HealthTrends />
      <AssessmentsSummary />
      <PeriodizationEngine />
      <SkillAssessment />
      <PerformanceSummary />
      <ExerciseLibrarySummary />
      <AppLaunch />
      <AcademiesPreview />
      <Credibility />
      <CTA />
    </>
  )
}
