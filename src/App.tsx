import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { RootLayout } from './components/layout/RootLayout'
import Home from './pages/Home'

/*
 * Home is imported eagerly — it's the landing route and the LCP target, so we
 * want it in the initial bundle. Every other page is code-split with lazy()
 * and only fetched when first visited, keeping the initial download small.
 */
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const WearablePage = lazy(() => import('./pages/Wearable'))
const Periodization = lazy(() => import('./pages/Periodization'))
const AssessmentsPage = lazy(() => import('./pages/Assessments'))
const CricketPage = lazy(() => import('./pages/CricketIntelligence'))
const Performance = lazy(() => import('./pages/Performance'))
const ExerciseLibrary = lazy(() => import('./pages/ExerciseLibrary'))
const ForAcademies = lazy(() => import('./pages/ForAcademies'))
const ForAthletes = lazy(() => import('./pages/ForAthletes'))
const About = lazy(() => import('./pages/About'))
const Support = lazy(() => import('./pages/Support'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Security = lazy(() => import('./pages/Security'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="wearable" element={<WearablePage />} />
        <Route path="periodization" element={<Periodization />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="cricket" element={<CricketPage />} />
        <Route path="performance" element={<Performance />} />
        <Route path="exercise-library" element={<ExerciseLibrary />} />
        <Route path="for-academies" element={<ForAcademies />} />
        <Route path="for-athletes" element={<ForAthletes />} />
        <Route path="about" element={<About />} />
        <Route path="support" element={<Support />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="security" element={<Security />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
