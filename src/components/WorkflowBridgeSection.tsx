import {
  SYNTHETIC_CB_ROWS,
  SYNTHETIC_IPO_OBSERVATIONS,
} from '../data/market-samples'
import { screenConvertibleBonds, summarizeIpoMarket } from '../lib'
import { SectionHeading } from './SectionHeading'

const CB_TOOL_URL = 'https://cb-zero-finder.vercel.app/'
const IPO_TOOL_URL = 'https://ipo-market-report.vercel.app/'

const CB_SAMPLE = screenConvertibleBonds(SYNTHETIC_CB_ROWS, {
  rateFilter: 'surface0',
  minAmountEok: 200,
})
const IPO_SAMPLE = summarizeIpoMarket(SYNTHETIC_IPO_OBSERVATIONS)

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function WorkflowBridgeSection() {
  return (
    <section className="workflow-section" id="lineage">
      <div className="page-shell section-pad">
        <SectionHeading
          eyebrow="02 / Domain lineage"
          title="Existing screens surface the event. This prototype conceptually examines why it matters."
          description="The project implements the same CB screening behavior in new TypeScript against fictional rows, then adds analogous IPO calculations inspired by an existing report. The live tools are conceptual references, not runtime dependencies."
        />

        <div className="workflow-grid">
          <article className="workflow-card">
            <header>
              <span>01</span>
              <p>OpenDART CB review</p>
            </header>
            <h3>Screen financing terms before reading the filing.</h3>
            <p>
              Normalize issue amount and rates, then filter by zero coupon, company,
              stock code, and minimum issue size. The passage model begins after a filing
              is selected.
            </p>
            <dl>
              <div>
                <dt>{CB_SAMPLE.matchedRows}</dt>
                <dd>sample matches</dd>
              </div>
              <div>
                <dt>{CB_SAMPLE.matchedAmountEok.toLocaleString('ko-KR')}</dt>
                <dd>₩100m units screened</dd>
              </div>
              <div>
                <dt>0.0%</dt>
                <dd>surface-rate condition</dd>
              </div>
            </dl>
            <a href={CB_TOOL_URL} target="_blank" rel="noreferrer">
              View existing CB tool <span aria-hidden="true">↗</span>
            </a>
          </article>

          <article className="workflow-card workflow-card--dark">
            <header>
              <span>02</span>
              <p>Korean IPO review</p>
            </header>
            <h3>Place company-level language inside market context.</h3>
            <p>
              Recompute offer-band position, first-day and current returns, total offer
              market capitalization, and below-offer frequency on a fictional structured
              snapshot fixed at {IPO_SAMPLE.asOfDate}.
            </p>
            <dl>
              <div>
                <dt>{IPO_SAMPLE.companyCount}</dt>
                <dd>sample IPOs</dd>
              </div>
              <div>
                <dt>{percent(IPO_SAMPLE.medianCurrentReturn)}</dt>
                <dd>median return · as of {IPO_SAMPLE.asOfDate}</dd>
              </div>
              <div>
                <dt>{percent(IPO_SAMPLE.belowOfferRatio)}</dt>
                <dd>below offer price</dd>
              </div>
            </dl>
            <a href={IPO_TOOL_URL} target="_blank" rel="noreferrer">
              View existing IPO report <span aria-hidden="true">↗</span>
            </a>
          </article>
        </div>

        <div
          className="workflow-handoff"
          role="group"
          aria-label="Illustrative workflow handoff"
        >
          <span>Fictional structured screen</span>
          <i aria-hidden="true">→</i>
          <span>Selected disclosure</span>
          <i aria-hidden="true">→</i>
          <strong>Passage classification + evidence memo</strong>
        </div>

        <p className="workflow-disclosure">
          This project does not import either existing repository or its production data.
          All displayed rows and issuers are fictional; no OpenDART key, private workbook,
          production API, or generated report is used.
        </p>
      </div>
    </section>
  )
}
