import { DOCUMENTS } from '../data/corpus'
import { RISK_TAXONOMY_BY_LABEL, type RiskLabel } from '../domain'
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

const PRIORITY_COPY: Readonly<Record<ReviewPriority, string>> = {
  High: 'High priority',
  Watch: 'Watch priority',
  Low: 'Low priority',
}

const RISK_CODES: Readonly<Record<RiskLabel, string>> = {
  'Dilution Risk': 'D',
  'Refinancing Risk': 'R',
  'Liquidity Risk': 'L',
  'Governance Risk': 'G',
  'Execution Risk': 'E',
  'Market Risk': 'M',
  'Low Risk / Informational': '—',
}

function priorityClass(priority: ReviewPriority): string {
  return `is-${priority.toLowerCase()}`
}

function segmentClass(label: RiskLabel): string {
  const id = RISK_TAXONOMY_BY_LABEL[label].id
  return label === INFORMATIONAL_RISK_LABEL ? `is-clear risk-${id}` : `is-flagged risk-${id}`
}

function plainDocumentType(documentType: string): string {
  return documentType.includes('CB')
    ? 'Fictional convertible-bond example'
    : 'Fictional IPO example'
}

export function RiskOverview() {
  return (
    <section className="risk-overview" aria-labelledby="risk-overview-title">
      <header className="risk-overview__header">
        <div>
          <span>Risk-signal matrix · transparent rule baseline</span>
          <h2 id="risk-overview-title">Which risks appear in each document?</h2>
          <p>
            Each row is one fictional filing; each coded block is one passage. The letter keeps
            the technical risk label visible, while the note below explains it in plain English.
          </p>
        </div>
        <div className="risk-overview__legend" aria-label="Review-priority thresholds">
          <span><i className="is-high" aria-hidden="true" />High · 4–6 matched passages</span>
          <span><i className="is-watch" aria-hidden="true" />Watch · 2–3</span>
          <span><i className="is-low" aria-hidden="true" />Low · 0–1</span>
        </div>
      </header>

      <div className="risk-overview__key" aria-label="Risk-code legend">
        {(['Dilution Risk', 'Refinancing Risk', 'Liquidity Risk', 'Governance Risk', 'Execution Risk', 'Market Risk'] as const).map((label) => (
          <span key={label}>
            <b className={`risk-code risk-${RISK_TAXONOMY_BY_LABEL[label].id}`}>{RISK_CODES[label]}</b>
            <span><strong>{label.replace(' Risk', '')}</strong><small>{RISK_TAXONOMY_BY_LABEL[label].readerLabel}</small></span>
          </span>
        ))}
      </div>

      <ol className="risk-overview__rows">
        {REVIEW_SUMMARIES.map((summary) => (
          <li key={summary.documentId}>
            <div className="risk-overview__document">
              <strong>{summary.companyName}</strong>
              <span>{plainDocumentType(summary.documentType)}</span>
            </div>

            <span className={`review-priority ${priorityClass(summary.priority)}`}>
              {PRIORITY_COPY[summary.priority]}
            </span>

            <div
              className="risk-overview__segments"
              role="img"
              aria-label={`Phrase rules matched ${summary.flaggedPassages} of ${summary.totalPassages} passages. ${summary.predictedLabels.map((label, index) => `Passage ${index + 1}: ${label}`).join('; ')}`}
            >
              {summary.predictedLabels.map((label, index) => (
                <span
                  className={segmentClass(label)}
                  key={`${summary.documentId}-${index}`}
                  title={`Passage ${index + 1}: ${label} — ${RISK_TAXONOMY_BY_LABEL[label].readerLabel}`}
                  aria-hidden="true"
                >{RISK_CODES[label]}</span>
              ))}
            </div>

            <div className="risk-overview__reading">
              <strong>
                {summary.flaggedPassages} of {summary.totalPassages} passages contain a match
              </strong>
              <span>
                {summary.leadingLabels.length
                  ? summary.leadingLabels.map((label) =>
                    `${label.replace(' Risk', '')}: ${RISK_TAXONOMY_BY_LABEL[label].readerLabel}`,
                  ).join(' · ')
                  : 'No main warning phrase found.'}
              </span>
            </div>
          </li>
        ))}
      </ol>

      <p className="risk-overview__note">
        <strong>Important:</strong> more filled blocks only mean “read more closely.” They do not
        mean the company is bad, predict its share price, or represent a probability. All five
        companies and passages in this NLP view are fictional.
      </p>
    </section>
  )
}
