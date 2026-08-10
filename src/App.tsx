import { DemoDashboard } from './components/DemoDashboard'
import { EvaluationSection } from './components/EvaluationSection'
import { Hero } from './components/Hero'
import { LimitationsSection } from './components/LimitationsSection'
import { MethodologySection } from './components/MethodologySection'
import { ProblemSection } from './components/ProblemSection'
import { RiskTaxonomySection } from './components/RiskTaxonomySection'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'

function App() {
  return (
    <div id="top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <ProblemSection />
        <MethodologySection />
        <DemoDashboard />
        <RiskTaxonomySection />
        <EvaluationSection />
        <LimitationsSection />
      </main>
      <SiteFooter />
    </div>
  )
}

export default App
