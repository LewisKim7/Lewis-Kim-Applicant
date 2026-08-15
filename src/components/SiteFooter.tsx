import { APPLICATION_CONTEXT } from '../config/application-profile'

const SOURCE_URL = 'https://github.com/LewisKim7/Lewis-Kim-Applicant'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell site-footer__inner">
        <div>
          <p className="site-footer__title">Korea IPO &amp; CB Risk Screener</p>
          <p>Yoochan Kim (Lewis Kim · 김유찬) · finance and deep-tech investment professional · 2026</p>
        </div>
        <div className="site-footer__links">
          <a href="#top">Back to top ↑</a>
          <a href={SOURCE_URL} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <a href={APPLICATION_CONTEXT.overviewUrl} target="_blank" rel="noreferrer">
            Graduate programs ↗
          </a>
        </div>
        <p className="site-footer__disclaimer">
          Independent applicant portfolio. Not affiliated with, endorsed by, or an official
          publication of {APPLICATION_CONTEXT.institutionName}. Fictional Korean-language
          demonstration only; not investment, legal, or regulatory advice.
        </p>
      </div>
    </footer>
  )
}
