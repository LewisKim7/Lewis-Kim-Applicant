const PROFILE_URL = 'https://personal-sns-beta.vercel.app/'
const HANYANG_URL = 'https://www.topuniversities.com/universities/hanyang-university?hl=ko-KR'
const CCVC_URL = 'https://ccvc.co.kr/'
const HANWHA_URL = 'https://www.hanwhafund.co.kr/en'
const DART_MANAGER_FILING_URL =
  'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20250826000004&dcmNo=10784143&keyword=%EA%B9%80%EC%9C%A0%EC%B0%AC'

const careerSteps = [
  { label: 'Foundation', value: 'Hanyang Business' },
  { label: 'Private markets', value: 'CCVC · DeepTech' },
  { label: 'Public markets', value: 'Hanwha · IPO / AI / Credit' },
  { label: 'Current focus', value: 'Korean IPOs · Fund management' },
] as const

export function ProfileSection() {
  return (
    <section className="profile-section section-pad" id="profile" aria-labelledby="profile-title">
      <div className="page-shell">
        <div className="profile-card">
          <div className="profile-card__portrait">
            <img
              src="/assets/yoochan-profile.png"
              alt="Illustrated profile of Yoochan Kim (Lewis Kim)"
              width="640"
              height="640"
              loading="lazy"
              decoding="async"
            />
            <div>
              <span>Applicant profile</span>
              <strong>Yoochan Kim</strong>
              <small>Lewis Kim · Finance &amp; DeepTech</small>
            </div>
          </div>

          <div className="profile-card__story">
            <p className="eyebrow">Finance domain → AI questions</p>
            <h2 id="profile-title">Korean capital-markets experience, translated into a testable NLP project.</h2>

            <p className="profile-card__bio">
              Yoochan Kim (Lewis Kim) graduated from the School of Business at{' '}
              <a href={HANYANG_URL} target="_blank" rel="noreferrer">
                Hanyang University
              </a>
              . At{' '}
              <a href={CCVC_URL} target="_blank" rel="noreferrer">
                Coolidge Corner Investment (CCVC)
              </a>
              , an influential early-stage venture capital firm in Korea, he evaluated deep-tech
              startups and built experience in private-company analysis. At{' '}
              <a href={HANWHA_URL} target="_blank" rel="noreferrer">
                Hanwha Asset Management
              </a>
              , part of Hanwha Group—ranked No. 5 among Korea’s large business groups by assets in
              2026—he has worked across IPO research, research on AI-related companies, credit
              research, and fund management. He currently focuses on Korean IPOs, including
              offering structures, institutional bookbuilding, post-listing flows, and valuation
              while managing related funds.
            </p>

            <a className="profile-card__link" href={PROFILE_URL} target="_blank" rel="noreferrer">
              View Lewis Kim profile
              <span aria-hidden="true">↗</span>
            </a>

            <a
              className="profile-card__evidence"
              href={DART_MANAGER_FILING_URL}
              target="_blank"
              rel="noreferrer"
            >
              <span className="profile-card__evidence-mark" aria-hidden="true">✓</span>
              <span>
                <small>FSS DART filing · 26 Aug 2025</small>
                <strong>Fund manager · Hanwha IPO Plus fund</strong>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <ol className="profile-trajectory" aria-label="Career path informing this project">
          {careerSteps.map((step) => (
            <li key={step.label}>
              <span>{step.label}</span>
              <strong>{step.value}</strong>
            </li>
          ))}
        </ol>

        <p className="profile-section__note">
          Professional affiliations are presented for biographical context only. The employers named above did not sponsor or review this project.
          The DART link records a dated public filing and is not presented as employer endorsement.
        </p>
      </div>
    </section>
  )
}
