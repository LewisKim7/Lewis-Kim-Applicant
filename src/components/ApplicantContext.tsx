import { APPLICATION_CONTEXT } from '../config/application-profile'

export function ApplicantContext() {
  return (
    <section className="applicant-context" aria-labelledby="applicant-name">
      <div className="page-shell applicant-card">
        <div className="applicant-card__identity">
          <h2 id="applicant-name">
            <span lang="ko">김유찬</span>
            <small>Yoochan Kim · Lewis</small>
          </h2>
          <span>Finance × Korean capital-markets NLP</span>
        </div>

        <a
          className="applicant-card__program"
          href={APPLICATION_CONTEXT.overviewUrl}
          target="_blank"
          rel="noreferrer"
        >
          <span className="applicant-card__program-label--long">
            {APPLICATION_CONTEXT.contextLabel}
          </span>
          <span className="applicant-card__program-label--compact">
            {APPLICATION_CONTEXT.compactLabel}
          </span>
          <strong>{APPLICATION_CONTEXT.portfolioLabel}</strong>
          <small>Official graduate-program page ↗</small>
        </a>

        <p className="applicant-card__disclaimer">
          Independent applicant portfolio · not affiliated with or endorsed by{' '}
          {APPLICATION_CONTEXT.institutionShort}.
        </p>
      </div>
    </section>
  )
}
