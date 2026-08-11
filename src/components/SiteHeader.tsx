const SOURCE_URL = 'https://github.com/LewisKim7/Korea-IPO-CB-Risk-Screener'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__global">
        <div className="page-shell site-header__global-inner">
          <a className="brand" href="#top" aria-label="Korea IPO and CB Risk Screener home">
            <span className="brand__mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>K-CAP / NLP</span>
          </a>

          <nav className="global-nav-links" aria-label="Project context">
            <a href="#problem">Problem</a>
            <a href="#lineage">Domain lineage</a>
            <a href="#method">Method</a>
          </nav>

          <a className="header-source" href={SOURCE_URL} target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="site-header__subnav">
        <div className="page-shell site-header__subnav-inner">
          <a href="#top" className="subnav-title">
            Korea IPO &amp; CB Risk Screener
          </a>
          <nav className="site-nav" aria-label="Primary navigation">
            <a href="#prototype">Prototype</a>
            <a href="#taxonomy">Taxonomy</a>
            <a href="#evaluation">Evaluation</a>
            <a className="site-nav__optional" href="#limitations">
              Limits
            </a>
            <a className="subnav-cta" href="#prototype">
              Explore
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
