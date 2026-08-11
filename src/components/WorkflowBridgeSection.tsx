import type { CSSProperties } from 'react'
import {
  SYNTHETIC_CB_ROWS,
  SYNTHETIC_IPO_OBSERVATIONS,
} from '../data/market-samples'
import {
  isZeroRate,
  parseFinancialNumber,
  screenConvertibleBonds,
  summarizeIpoMarket,
} from '../lib'
import { SectionHeading } from './SectionHeading'

const CB_TOOL_URL = 'https://cb-zero-finder.vercel.app/'
const IPO_TOOL_URL = 'https://ipo-market-report.vercel.app/'

const ALL_CB_SAMPLE = screenConvertibleBonds(SYNTHETIC_CB_ROWS)
const BOTH_ZERO_SAMPLE = screenConvertibleBonds(SYNTHETIC_CB_ROWS, {
  rateFilter: 'both0',
})
const CB_VISUAL_ROWS = ALL_CB_SAMPLE.rows
  .map((row) => ({
    ...row,
    amount: parseFinancialNumber(row.amountEok),
    coupon: parseFinancialNumber(row.surfaceRate),
    maturityYield: parseFinancialNumber(row.maturityRate),
    bothZero: isZeroRate(row.surfaceRate) && isZeroRate(row.maturityRate),
  }))
  .sort((a, b) => b.amount - a.amount)
const MAX_CB_AMOUNT = Math.max(...CB_VISUAL_ROWS.map(({ amount }) => amount), 1)
const BOTH_ZERO_AMOUNT_SHARE = ALL_CB_SAMPLE.matchedAmountEok
  ? BOTH_ZERO_SAMPLE.matchedAmountEok / ALL_CB_SAMPLE.matchedAmountEok
  : 0

const IPO_SAMPLE = summarizeIpoMarket(SYNTHETIC_IPO_OBSERVATIONS)
const IPO_VISUAL_ROWS = [...IPO_SAMPLE.observations].sort(
  (a, b) => b.currentReturn - a.currentReturn,
)
const MAX_IPO_RETURN = Math.max(
  ...IPO_VISUAL_ROWS.map(({ currentReturn }) => Math.abs(currentReturn)),
  0.01,
)

function percent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`
}

function rate(value: number): string {
  return `${value.toFixed(1)}%`
}

function amountBn(amountEok: number): string {
  return `₩${(amountEok / 10).toFixed(1)}bn`
}

function cbBarStyle(value: number): CSSProperties {
  return { '--bar-size': `${(value / MAX_CB_AMOUNT) * 100}%` } as CSSProperties
}

function returnBarStyle(value: number): CSSProperties {
  return {
    '--return-size': `${(Math.abs(value) / MAX_IPO_RETURN) * 50}%`,
  } as CSSProperties
}

export function WorkflowBridgeSection() {
  return (
    <section className="workflow-section" id="lineage">
      <div className="page-shell section-pad">
        <SectionHeading
          eyebrow="01 / Market screen"
          title="Market terms first. Evidence next."
          description="Two deterministic snapshots turn Korean financing terms and IPO outcomes into visible review questions before the NLP pipeline reads a passage."
        />

        <div className="market-visual-grid">
          <figure className="market-chart market-chart--cb">
            <figcaption>
              <div>
                <span className="market-chart__eyebrow">Fictional CB terms · proposed principal</span>
                <h3>CB principal by issuer</h3>
                <p>₩bn · four synthetic observations · blue marks an explicit 0.0% / 0.0% match</p>
              </div>
              <a href={CB_TOOL_URL} target="_blank" rel="noreferrer">
                CB tool ↗
              </a>
            </figcaption>

            <dl className="market-chart__kpis">
              <div>
                <dt>{BOTH_ZERO_SAMPLE.matchedRows} / {ALL_CB_SAMPLE.totalRows}</dt>
                <dd>coupon 0% + maturity yield 0%</dd>
              </div>
              <div>
                <dt>{amountBn(BOTH_ZERO_SAMPLE.matchedAmountEok)}</dt>
                <dd>0% / 0% proposed principal</dd>
              </div>
              <div>
                <dt>{percent(BOTH_ZERO_AMOUNT_SHARE)}</dt>
                <dd>of {amountBn(ALL_CB_SAMPLE.matchedAmountEok)} sample principal</dd>
              </div>
            </dl>

            <ol className="cb-funding-bars" aria-label="Fictional convertible-bond proposed principal">
              {CB_VISUAL_ROWS.map((row) => (
                <li
                  className={row.bothZero ? 'is-both-zero' : undefined}
                  key={row.receiptNo}
                  aria-label={`${row.corpName}, proposed principal ${row.amount} hundred million won, coupon ${rate(row.coupon)}, maturity yield ${rate(row.maturityYield)}${row.bothZero ? ', zero-zero match' : ''}`}
                >
                  <div className="cb-funding-bars__label">
                    <strong lang="ko">{row.corpName}</strong>
                    <span>{amountBn(row.amount)}</span>
                  </div>
                  <div className="cb-funding-bars__terms">
                    <span>Coupon {rate(row.coupon)}</span>
                    <span>Maturity {rate(row.maturityYield)}</span>
                    {row.bothZero ? <em>0 / 0 match</em> : null}
                  </div>
                  <span className="cb-funding-bars__track" aria-hidden="true">
                    <span style={cbBarStyle(row.amount)} />
                  </span>
                </li>
              ))}
            </ol>

            <p className="market-chart__note">
              A 0.0% coupon and 0.0% maturity yield do not establish low effective financing
              cost; conversion, reset, put, call, and redemption terms still require review.
            </p>
          </figure>

          <figure className="market-chart market-chart--ipo">
            <figcaption>
              <div>
                <span className="market-chart__eyebrow">Fictional IPO snapshot</span>
                <h3>Current return vs offer price</h3>
                <p>{IPO_SAMPLE.companyCount} observations · as of {IPO_SAMPLE.asOfDate} · symmetric zero baseline</p>
              </div>
              <a href={IPO_TOOL_URL} target="_blank" rel="noreferrer">
                IPO report ↗
              </a>
            </figcaption>

            <dl className="market-chart__kpis market-chart__kpis--compact">
              <div>
                <dt>{percent(IPO_SAMPLE.medianFirstDayReturn)}</dt>
                <dd>median first-day return</dd>
              </div>
              <div>
                <dt>{percent(IPO_SAMPLE.medianCurrentReturn, 2)}</dt>
                <dd>median current return</dd>
              </div>
              <div>
                <dt>{IPO_SAMPLE.belowOfferCount} / {IPO_SAMPLE.companyCount}</dt>
                <dd>below offer price</dd>
              </div>
            </dl>

            <div className="ipo-return-axis" aria-hidden="true">
              <span>−{percent(MAX_IPO_RETURN)}</span>
              <span>Offer 0%</span>
              <span>+{percent(MAX_IPO_RETURN)}</span>
            </div>
            <ol className="ipo-return-bars" aria-label="Fictional IPO current returns versus offer price">
              {IPO_VISUAL_ROWS.map((row) => (
                <li
                  className={row.currentReturn < 0 ? 'is-negative' : 'is-positive'}
                  key={row.companyName}
                  aria-label={`${row.companyName}, current return ${percent(row.currentReturn)}, ${row.market}, as of ${row.asOfDate}`}
                >
                  <span lang="ko">{row.companyName}</span>
                  <span className="ipo-return-bars__track" aria-hidden="true">
                    <span style={returnBarStyle(row.currentReturn)} />
                  </span>
                  <strong>{row.currentReturn > 0 ? '+' : ''}{percent(row.currentReturn)}</strong>
                </li>
              ))}
            </ol>

            <div className="market-chart__legend" aria-label="Return chart legend">
              <span><i className="is-positive" aria-hidden="true" /> At or above offer</span>
              <span><i className="is-negative" aria-hidden="true" /> Below offer</span>
            </div>
          </figure>
        </div>

        <div className="workflow-handoff" role="group" aria-label="Illustrative workflow handoff">
          <span>Structured market screen</span>
          <i aria-hidden="true">→</i>
          <span>Selected disclosure</span>
          <i aria-hidden="true">→</i>
          <strong>Passage classification + evidence memo</strong>
        </div>

        <p className="workflow-disclosure">
          All issuers, amounts, prices, and dates above are fictional interface fixtures—not
          Korean market statistics or verified proceeds. The project reimplements screening
          behavior locally and does not import either linked tool, production data, or an OpenDART key.
        </p>
      </div>
    </section>
  )
}
