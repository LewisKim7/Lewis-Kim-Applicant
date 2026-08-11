import { DOCUMENTS } from '../data/corpus'
import type { RiskLabel } from '../domain'
import {
  INFORMATIONAL_RISK_LABEL,
  summarizeDocumentReview,
  type ReviewPriority,
} from '../lib/review-priority'

const REVIEW_SUMMARIES = DOCUMENTS.map(summarizeDocumentReview).sort(
  (left, right) =>
    right.flaggedPassages - left.flaggedPassages ||
    left.companyName.localeCompare(right.companyName, 'en'),
)

const PLAIN_LANGUAGE_LABELS: Readonly<Record<RiskLabel, string>> = {
  'Dilution Risk': 'ownership dilution',
  'Refinancing Risk': 'debt repayment',
  'Liquidity Risk': 'cash pressure',
  'Governance Risk': 'control & conflicts',
  'Execution Risk': 'delivery milestones',
  'Market Risk': 'demand & pricing',
  'Low Risk / Informational': 'routine information',
}

function priorityClass(priority: ReviewPriority): string {
  return `is-${priority.toLowerCase()}`
}

function segmentClass(label: RiskLabel): string {
  return label === INFORMATIONAL_RISK_LABEL ? 'is-clear' : 'is-flagged'
}

export function RiskOverview() {
  return (
    <section className="risk-overview" aria-labelledby="risk-overview-title">
      <header className="risk-overview__header">
        <div>
          <span>At-a-glance risk signals · rule baseline</span>
          <h2 id="risk-overview-title">Which documents should be read first?</h2>
        </div>
        <div className="risk-overview__legend" aria-label="Review-priority thresholds">
          <span><i className="is-high" aria-hidden="true" />High · 4–6 flags</span>
          <span><i className="is-watch" aria-hidden="true" />Watch · 2–3 flags</span>
          <span><i className="is-low" aria-hidden="true" />Low · 0–1 flags</span>
        </div>
      </header>

      <ol className="risk-overview__rows">
        {REVIEW_SUMMARIES.map((summary) => (
          <li key={summary.documentId}>
            <div className="risk-overview__document">
              <strong>{summary.companyName}</strong>
              <span>{summary.documentType.replace(' Excerpt', '')}</span>
            </div>

            <span className={`review-priority ${priorityClass(summary.priority)}`}>
              {summary.priority} priority
            </span>

            <div
              className="risk-overview__segments"
              role="img"
              aria-label={`${summary.flaggedPassages} of ${summary.totalPassages} passages contain configured risk signals`}
            >
              {summary.predictedLabels.map((label, index) => (
                <i
                  className={segmentClass(label)}
                  key={`${summary.documentId}-${index}`}
                  title={`Passage ${index + 1}: ${label}`}
                  aria-hidden="true"
                />
              ))}
            </div>

            <div className="risk-overview__reading">
              <strong>
                {summary.flaggedPassages} of {summary.totalPassages} passages flagged
              </strong>
              <span>
                {summary.leadingLabels.length
                  ? `Look for ${summary.leadingLabels.map((label) => PLAIN_LANGUAGE_LABELS[label]).join(' and ')}.`
                  : 'No configured risk phrase was found.'}
              </span>
            </div>
          </li>
        ))}
      </ol>

      <p className="risk-overview__note">
        <strong>How to read this:</strong> one filled block means the transparent rule baseline
        found a configured risk phrase in one passage. More blocks raise reading priority; they
        do not rate company quality, predict returns, or represent a probability. All five
        companies and passages in this NLP view are fictional.
      </p>
    </section>
  )
}
