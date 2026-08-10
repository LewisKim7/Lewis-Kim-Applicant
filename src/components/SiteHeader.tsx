const SOURCE_URL = 'https://github.com/LewisKim7/AI-Disclosure-Risk-Screener'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner page-shell">
        <a className="brand" href="#top" aria-label="AI Disclosure Risk Screener home">
          <span className="brand__mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>Disclosure / Risk</span>
        </a>

        <nav className="site-nav" aria-label="Primary navigation">
          <a className="site-nav__optional" href="#method">
            Method
          </a>
          <a href="#prototype">Prototype</a>
          <a href="#evaluation">Evaluation</a>
          <a className="site-nav__optional" href="#limitations">
            Limits
          </a>
        </nav>

        <a className="header-source" href={SOURCE_URL} target="_blank" rel="noreferrer">
          Source
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  )
}
