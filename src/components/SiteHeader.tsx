const SOURCE_URL = 'https://github.com/LewisKim7/Lewis-Kim-Applicant'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-shell site-header__bar">
        <a className="header-brand" href="#top" aria-label="Korea IPO and CB Risk Screener home">
          <img src="/favicon.svg" alt="" aria-hidden="true" />
          <span className="header-brand__long">Korea IPO &amp; CB Risk Screener</span>
          <span className="header-brand__short">KOR IPO · CB Risk</span>
        </a>

        <nav className="header-nav" aria-label="Primary navigation">
          <a href="#ipo-report">IPO Report</a>
          <a href="#cb-finder">CB Finder</a>
          <a href="#prototype">NLP Demo</a>
          <a href="#evaluation">Evaluation</a>
        </nav>

        <div className="header-actions">
          <a className="header-profile" href="#profile">
            <span className="header-profile__long">Lewis Kim Profile</span>
            <span className="header-profile__short">Profile</span>
          </a>
          <a className="header-source" href={SOURCE_URL} target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a className="header-explore" href="#market-tools">
            Tools
          </a>
        </div>
      </div>
    </header>
  )
}
