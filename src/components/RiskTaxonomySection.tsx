import { RISK_TAXONOMY } from '../domain'
import { SectionHeading } from './SectionHeading'

const KOREAN_LABELS: Readonly<Record<string, string>> = {
  'Dilution Risk': '희석 위험',
  'Refinancing Risk': '차환 위험',
  'Liquidity Risk': '유동성 위험',
  'Governance Risk': '지배구조 위험',
  'Execution Risk': '실행 위험',
  'Market Risk': '시장 위험',
  'Low Risk / Informational': '낮은 위험 / 정보성',
}

export function RiskTaxonomySection() {
  return (
    <section className="taxonomy-section page-shell section-pad" id="taxonomy">
      <SectionHeading
        eyebrow="05 / Risk taxonomy"
        title="Seven risk labels, each with a plain-English note."
        description="The formal finance label remains primary; a short annotation explains what a non-specialist should ask."
      />

      <div className="taxonomy-grid">
        {RISK_TAXONOMY.map((entry, index) => (
          <article className={`taxonomy-card taxonomy-card--${entry.id}`} key={entry.label}>
            <header>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span className="taxonomy-card__marker" aria-hidden="true" />
            </header>
            <h3>
              {entry.label}
              <span>{KOREAN_LABELS[entry.label]}</span>
            </h3>
            <p className="taxonomy-card__plain">
              <strong>Plain English</strong>
              {entry.readerLabel} — {entry.plainQuestion}
            </p>
            <details>
              <summary>Technical definition</summary>
              <p>{entry.description}</p>
            </details>
          </article>
        ))}
      </div>
    </section>
  )
}
