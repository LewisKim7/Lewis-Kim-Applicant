import { RISK_TAXONOMY } from '../domain'
import { SectionHeading } from './SectionHeading'

export function RiskTaxonomySection() {
  return (
    <section className="taxonomy-section page-shell section-pad" id="taxonomy">
      <SectionHeading
        eyebrow="04 / Risk taxonomy"
        title="Seven labels, each tied to an analyst question."
        description="The taxonomy is intentionally compact. It forces a primary-label decision while making overlapping risks visible through competing rule scores."
      />

      <div className="taxonomy-grid">
        {RISK_TAXONOMY.map((entry, index) => (
          <article className={`taxonomy-card taxonomy-card--${entry.id}`} key={entry.label}>
            <header>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span className="taxonomy-card__marker" aria-hidden="true" />
            </header>
            <h3>{entry.label}</h3>
            <p>{entry.description}</p>
            <details>
              <summary>Analyst question</summary>
              <p>{entry.analystQuestion}</p>
            </details>
          </article>
        ))}
      </div>
    </section>
  )
}
