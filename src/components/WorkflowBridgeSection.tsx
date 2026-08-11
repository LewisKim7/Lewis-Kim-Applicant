import { useEffect, useState, type CSSProperties } from 'react'
import {
  FROZEN_MARKET_SNAPSHOT,
  type FrozenCbRow,
  type FrozenIpoReturn,
} from '../data/market-snapshot'
import { SectionHeading } from './SectionHeading'

type ToolKey = 'ipo' | 'cb'

const DART_FILING_URL = 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo='
const IPO_MAX_RETURN = Math.max(
  ...FROZEN_MARKET_SNAPSHOT.ipo.featuredReturns.map(({ currentReturnPct }) =>
    Math.abs(currentReturnPct),
  ),
)
const CB_MAX_AMOUNT = Math.max(
  ...FROZEN_MARKET_SNAPSHOT.cb.featuredRows.map(({ amountEok }) => amountEok),
)

function selectedToolFromHash(): ToolKey {
  if (typeof window === 'undefined') return 'ipo'
  return window.location.hash === '#cb-finder' ? 'cb' : 'ipo'
}

function signedPercent(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

function amountBn(amountEok: number): string {
  return `₩${(amountEok / 10).toFixed(1)}bn`
}

function ipoReturnStyle(row: FrozenIpoReturn): CSSProperties {
  return {
    '--return-size': `${(Math.abs(row.currentReturnPct) / IPO_MAX_RETURN) * 50}%`,
  } as CSSProperties
}

function cbAmountStyle(row: FrozenCbRow): CSSProperties {
  return {
    '--bar-size': `${(row.amountEok / CB_MAX_AMOUNT) * 100}%`,
  } as CSSProperties
}

interface EvidenceShareBarProps {
  readonly title: string
  readonly subtitle: string
  readonly matched: number
  readonly total: number
  readonly matchedLabel: string
  readonly remainderLabel: string
}

function EvidenceShareBar({
  title,
  subtitle,
  matched,
  total,
  matchedLabel,
  remainderLabel,
}: EvidenceShareBarProps) {
  const matchedShare = (matched / total) * 100
  const remainder = total - matched
  const style = { '--share-size': `${matchedShare}%` } as CSSProperties

  return (
    <figure className="evidence-share">
      <figcaption>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </figcaption>
      <div
        className="evidence-share__track"
        role="img"
        aria-label={`${matched} of ${total}: ${matchedLabel}; ${remainder} of ${total}: ${remainderLabel}`}
        style={style}
      >
        <span aria-hidden="true" />
      </div>
      <div className="evidence-share__labels">
        <span>
          <i aria-hidden="true" />
          <strong>{matched} ({matchedShare.toFixed(1)}%)</strong> {matchedLabel}
        </span>
        <span><i aria-hidden="true" /><strong>{remainder}</strong> {remainderLabel}</span>
      </div>
    </figure>
  )
}

function IpoSnapshot() {
  const snapshot = FROZEN_MARKET_SNAPSHOT.ipo

  return (
    <div className="tool-evidence">
      <div className="tool-evidence__heading">
        <span>Frozen evidence · source data 07 Aug 2026</span>
        <h3>IPO returns rarely end on listing day.</h3>
        <p>
          <strong>IPO (initial public offering):</strong> the first sale of a company&apos;s shares
          to public investors. This report follows 52 Korean IPOs from their offer price to later
          market prices.
        </p>
      </div>

      <dl className="tool-kpis" aria-label="Frozen IPO report summary">
        <div>
          <dt>{snapshot.companyCount}</dt>
          <dd>IPOs</dd>
        </div>
        <div>
          <dt>₩{snapshot.totalOfferMarketCapTrillionKrw.toFixed(1)}tn</dt>
          <dd>offer market cap<small>value at IPO prices</small></dd>
        </div>
        <div>
          <dt>{signedPercent(snapshot.averageCurrentReturnPct)}</dt>
          <dd>current return<small>average change since IPO</small></dd>
        </div>
        <div>
          <dt>{snapshot.belowOfferCount}/{snapshot.companyCount}</dt>
          <dd>below offer<small>now below IPO price</small></dd>
        </div>
      </dl>

      <EvidenceShareBar
        title="Current position versus IPO price"
        subtitle="52-company frozen snapshot"
        matched={snapshot.belowOfferCount}
        total={snapshot.companyCount}
        matchedLabel="below IPO price"
        remainderLabel="at or above IPO price"
      />

      <figure className="frozen-chart frozen-chart--ipo">
        <figcaption>
          <strong>Selected current returns vs offer price</strong>
          <span>0% = unchanged from the IPO price · right is above, left is below</span>
        </figcaption>
        <ol>
          {snapshot.featuredReturns.map((row) => (
            <li
              className={row.currentReturnPct < 0 ? 'is-negative' : 'is-positive'}
              key={row.companyNameKo}
              aria-label={`${row.companyNameEn}, ${row.companyNameKo}, current return ${signedPercent(row.currentReturnPct)}`}
            >
              <span className="frozen-chart__company">
                <strong>{row.companyNameEn}</strong>
                <small lang="ko">{row.companyNameKo}</small>
              </span>
              <span className="frozen-return-track" aria-hidden="true">
                <span style={ipoReturnStyle(row)} />
              </span>
              <b>{signedPercent(row.currentReturnPct)}</b>
            </li>
          ))}
        </ol>
      </figure>

      <p className="tool-insight">
        <strong>Plain-English takeaway:</strong> shares rose sharply on the first day on average,
        but 36 of 52 were later below their IPO price. Price data shows what happened; the filing
        text may help explain what investors needed to examine.
      </p>

      <p className="tool-provenance">
        Source: applicant&apos;s public IPO Market Report · {snapshot.periodLabel} · generated{' '}
        {snapshot.generatedAt}. Values are frozen in this portfolio and may differ from the
        linked operational report after a later update.
      </p>
    </div>
  )
}

function CbSnapshot() {
  const snapshot = FROZEN_MARKET_SNAPSHOT.cb

  return (
    <div className="tool-evidence">
      <div className="tool-evidence__heading">
        <span>Frozen evidence · captured 11 Aug 2026</span>
        <h3>Zero stated interest is a screen—not a conclusion.</h3>
        <p>
          <strong>Convertible bond (CB):</strong> money a company borrows that may later turn into
          shares. This finder locates filings that state 0% interest so an analyst can inspect
          the conversion and repayment terms.
        </p>
      </div>

      <dl className="tool-kpis" aria-label="Frozen convertible-bond finder summary">
        <div>
          <dt>{snapshot.filingRowCount}</dt>
          <dd>90-day filing rows<small>filings checked</small></dd>
        </div>
        <div>
          <dt>{snapshot.bothZeroRowCount}</dt>
          <dd>0% / 0% rows<small>both stated rates are zero</small></dd>
        </div>
        <div>
          <dt>{snapshot.bothZeroIssuerCount}</dt>
          <dd>issuer names<small>companies represented</small></dd>
        </div>
        <div>
          <dt>₩{(snapshot.bothZeroAmountEok / 10_000).toFixed(2)}tn</dt>
          <dd>proposed principal<small>amount companies plan to raise</small></dd>
        </div>
      </dl>

      <EvidenceShareBar
        title="Strict 0% coupon / 0% maturity-yield screen"
        subtitle="118 filing rows in the frozen 90-day snapshot"
        matched={snapshot.bothZeroRowCount}
        total={snapshot.filingRowCount}
        matchedLabel="matched both rates"
        remainderLabel="did not match both rates"
      />

      <figure className="frozen-chart frozen-chart--cb">
        <figcaption>
          <strong>Largest five filings that state 0% / 0%</strong>
          <span>Bar length = amount the company proposed to raise</span>
        </figcaption>
        <ol>
          {snapshot.featuredRows.map((row) => (
            <li
              key={row.receiptNo}
              aria-label={`${row.companyNameEn}, ${row.companyNameKo}, proposed principal ${row.amountEok} hundred million won, zero percent coupon and zero percent maturity yield`}
            >
              <a
                className="frozen-chart__company"
                href={`${DART_FILING_URL}${row.receiptNo}`}
                target="_blank"
                rel="noreferrer"
              >
                <strong>{row.companyNameEn}</strong>
                <small lang="ko">{row.companyNameKo} · {row.stockCode}</small>
              </a>
              <span className="frozen-cb-terms">
                <em>0% / 0%</em>
                <small>{row.receiptDate}</small>
              </span>
              <span className="frozen-cb-track" aria-hidden="true">
                <span style={cbAmountStyle(row)} />
              </span>
              <b>{amountBn(row.amountEok)}</b>
            </li>
          ))}
        </ol>
      </figure>

      <p className="tool-insight">
        <strong>Plain-English takeaway:</strong> 41 filing rows from 40 company names stated both
        rates as 0%. That does not mean the financing is free or harmless: new shares may still
        be created and repayment terms may still matter. Missing “−” values are excluded.
      </p>

      <p className="tool-provenance">
        Source: applicant&apos;s public CB Zero Finder / OpenDART snapshot ·{' '}
        {snapshot.periodStart} to {snapshot.periodEnd} · captured {snapshot.capturedAtLabel}.
        Filing rows can include multiple disclosures for one issuer.
      </p>
    </div>
  )
}

export function WorkflowBridgeSection() {
  const [activeTool, setActiveTool] = useState<ToolKey>(selectedToolFromHash)
  const source = activeTool === 'ipo'
    ? FROZEN_MARKET_SNAPSHOT.ipo
    : FROZEN_MARKET_SNAPSHOT.cb

  useEffect(() => {
    const syncHash = () => setActiveTool(selectedToolFromHash())
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  return (
    <section className="workflow-section" id="market-tools">
      <div className="page-shell section-pad">
        <SectionHeading
          eyebrow="01 / Production tools"
          title="Two live tools. One NLP study."
          description="The professional market terms remain intact; concise annotations explain what each measure means before the reviewer reaches the Korean NLP evidence."
        />

        <div className="tool-tabs" role="tablist" aria-label="Applicant finance tools">
          <button
            id="ipo-report"
            type="button"
            role="tab"
            aria-controls="tool-panel-ipo"
            aria-selected={activeTool === 'ipo'}
            onClick={() => setActiveTool('ipo')}
          >
            <span>01</span>
            IPO Return Report
            <small>52 companies · price changes after listing</small>
          </button>
          <button
            id="cb-finder"
            type="button"
            role="tab"
            aria-controls="tool-panel-cb"
            aria-selected={activeTool === 'cb'}
            onClick={() => setActiveTool('cb')}
          >
            <span>02</span>
            CB Disclosure Finder
            <small>OpenDART · bonds stating 0% interest</small>
          </button>
        </div>

        <div
          className="tool-panel"
          id={`tool-panel-${activeTool}`}
          role="tabpanel"
          aria-labelledby={activeTool === 'ipo' ? 'ipo-report' : 'cb-finder'}
        >
          {activeTool === 'ipo' ? <IpoSnapshot /> : <CbSnapshot />}

          <div className="tool-embed">
            <div className="tool-embed__bar">
              <div>
                <i aria-hidden="true" />
                <span>Embedded operational tool</span>
              </div>
              <a href={source.sourceUrl} target="_blank" rel="noreferrer">
                Open full tool <span aria-hidden="true">↗</span>
              </a>
            </div>
            <iframe
              key={activeTool}
              src={source.sourceUrl}
              title={activeTool === 'ipo' ? 'IPO Market Report interactive viewer' : 'CB Zero Finder interactive search tool'}
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox="allow-downloads allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            />
            <p>
              Live source view · Korean interface · this operational tool may update independently
              from the frozen portfolio snapshot.
            </p>
          </div>
        </div>

        <div className="workflow-handoff" role="group" aria-label="Project learning bridge">
          <span>Deterministic finance screens</span>
          <i aria-hidden="true">→</i>
          <span>Korean disclosure passages</span>
          <i aria-hidden="true">→</i>
          <strong>Classification · retrieval · error analysis</strong>
        </div>

        <p className="workflow-disclosure">
          <strong>Data boundary:</strong> the market panel uses dated evidence from the two linked
          public tools. The NLP evaluation below uses a separate synthetic Korean corpus so no
          invented risk passage or model label is attributed to a real company.
        </p>
      </div>
    </section>
  )
}
