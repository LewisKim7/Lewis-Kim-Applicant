import { APPLICATION_CONTEXT } from '../config/application-profile'
import { ApplicationBadge } from './ApplicationBadge'

export function ApplicantContext() {
  return (
    <section className="applicant-context" aria-labelledby="application-context-title">
      <div className="page-shell applicant-card">
        <div className="applicant-card__identity">
          <h2 id="application-context-title">Independent applicant portfolio</h2>
          <span>Korean finance × transparent NLP</span>
        </div>

        <a
          className="applicant-card__program"
          href={APPLICATION_CONTEXT.overviewUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open the official ${APPLICATION_CONTEXT.institutionShort} graduate-program page`}
        >
          <ApplicationBadge
            accent={APPLICATION_CONTEXT.badgeAccent}
            detail={APPLICATION_CONTEXT.badgeDetail}
          />
          <span className="applicant-card__program-copy">
            <span className="applicant-card__program-label--long">
              {APPLICATION_CONTEXT.contextLabel}
            </span>
            <span className="applicant-card__program-label--compact">
              {APPLICATION_CONTEXT.compactLabel}
            </span>
            <strong>{APPLICATION_CONTEXT.portfolioLabel}</strong>
            <small>Official graduate programs ↗</small>
          </span>
        </a>
      </div>
    </section>
  )
}
