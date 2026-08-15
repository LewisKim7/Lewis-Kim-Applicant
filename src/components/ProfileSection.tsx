const PROFILE_URL = 'https://personal-sns-beta.vercel.app/'
const HANYANG_URL = 'https://www.topuniversities.com/universities/hanyang-university?hl=ko-KR'
const CCVC_URL = 'https://ccvc.co.kr/'
const HANWHA_URL = 'https://www.hanwhafund.co.kr/en'
const DART_MANAGER_FILING_URL =
  'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20250826000004&dcmNo=10784143&keyword=%EA%B9%80%EC%9C%A0%EC%B0%AC'

export function ProfileSection() {
  return (
    <section className="hero-profile" id="profile" aria-labelledby="profile-title">
      <img
        src="/assets/yoochan-profile.png"
        alt="Illustrated profile of Yoochan Kim (Lewis Kim)"
        width="640"
        height="640"
        decoding="async"
        fetchPriority="high"
      />

      <div className="hero-profile__body">
        <header>
          <span>Applicant · Finance domain lead</span>
          <h2 id="profile-title">Yoochan Kim <small>Lewis Kim</small></h2>
        </header>

        <p>
          A finance and deep-tech investment professional who studied business at{' '}
          <a href={HANYANG_URL} target="_blank" rel="noreferrer">Hanyang University</a>,
          evaluated early-stage technology companies at{' '}
          <a href={CCVC_URL} target="_blank" rel="noreferrer">
            Coolidge Corner Investment (CCVC)
          </a>
          —an influential Korean early-stage VC—and now researches IPOs, AI-related companies,
          and credit while managing funds at{' '}
          <a href={HANWHA_URL} target="_blank" rel="noreferrer">
            Hanwha Asset Management
          </a>
          , part of Hanwha Group, Korea&apos;s No. 5 business group by assets in 2026.
        </p>

        <div className="hero-profile__links">
          <a href={PROFILE_URL} target="_blank" rel="noreferrer">
            View Lewis Kim profile <span aria-hidden="true">↗</span>
          </a>
          <a href={DART_MANAGER_FILING_URL} target="_blank" rel="noreferrer">
            Fund manager · Hanwha IPO Plus fund <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  )
}
