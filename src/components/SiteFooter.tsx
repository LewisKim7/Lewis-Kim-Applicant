const SOURCE_URL = 'https://github.com/LewisKim7/AI-Disclosure-Risk-Screener'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell site-footer__inner">
        <div>
          <p className="site-footer__title">AI Disclosure Risk Screener</p>
          <p>Independent graduate-study preparation project · 2026</p>
        </div>
        <div className="site-footer__links">
          <a href="#top">Back to top ↑</a>
          <a href={SOURCE_URL} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </div>
        <p className="site-footer__disclaimer">
          Educational demonstration only. Not investment, legal, or regulatory advice.
        </p>
      </div>
    </footer>
  )
}
