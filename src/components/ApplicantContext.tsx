const PROGRAM_URL = 'https://cdso.utexas.edu/msai'

export function ApplicantContext() {
  return (
    <section className="applicant-context" aria-labelledby="applicant-name">
      <div className="page-shell applicant-card">
        <img className="applicant-mark" src="/favicon.svg" alt="" aria-hidden="true" />

        <div className="applicant-card__identity">
          <p>Independent applicant portfolio · Prepared for UT Austin MSAI</p>
          <h2 id="applicant-name">
            <span lang="ko">김유찬</span>
            <small>Yoochan Kim · Lewis</small>
          </h2>
          <span>Finance &amp; deep-tech investment professional · Korean capital-markets NLP</span>
        </div>

        <a
          className="applicant-card__program"
          href={PROGRAM_URL}
          target="_blank"
          rel="noreferrer"
        >
          <span>Program of interest</span>
          <strong>Master of Science in Artificial Intelligence</strong>
          <small>The University of Texas at Austin · Official program page ↗</small>
        </a>

        <p className="applicant-card__disclaimer">
          Optional supporting evidence for an application · independent and not affiliated with
          or endorsed by The University of Texas at Austin.
        </p>
      </div>
    </section>
  )
}
