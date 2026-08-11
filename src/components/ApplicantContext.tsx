const PROGRAM_URL = 'https://cdso.utexas.edu/msai'

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
          href={PROGRAM_URL}
          target="_blank"
          rel="noreferrer"
        >
          <span>UT Austin MSAI application</span>
          <strong>Master of Science in Artificial Intelligence</strong>
          <small>Official program page ↗</small>
        </a>

        <p className="applicant-card__disclaimer">
          Independent applicant portfolio · not affiliated with or endorsed by UT Austin.
        </p>
      </div>
    </section>
  )
}
