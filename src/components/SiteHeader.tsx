const SOURCE_URL = 'https://github.com/LewisKim7/Korea-IPO-CB-Risk-Screener'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-shell site-header__bar">
        <a className="header-brand" href="#top" aria-label="Korea IPO and CB Risk Screener home">
          <img src="/favicon.svg" alt="" aria-hidden="true" />
          <span className="header-brand__long">Korea IPO &amp; CB Risk Screener</span>
          <span className="header-brand__short">IPO &amp; CB NLP</span>
        </a>

        <nav className="header-nav" aria-label="Primary navigation">
          <a href="#lineage">Market screen</a>
          <a href="#problem">Problem</a>
          <a href="#method">Method</a>
          <a href="#evaluation">Evaluation</a>
        </nav>

        <div className="header-actions">
          <a className="header-source" href={SOURCE_URL} target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a className="header-explore" href="#prototype">
            Explore
          </a>
        </div>
      </div>
    </header>
  )
}
