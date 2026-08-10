import { SectionHeading } from './SectionHeading'

export function ProblemSection() {
  return (
    <section className="problem-section page-shell section-pad" id="problem">
      <SectionHeading
        eyebrow="01 / Problem framing"
        title="Korean deal terms are structured. Their implications are not."
        description="A CB issuance decision or IPO prospectus can spread dilution, repayment, liquidity, control, and execution signals across tables and dense Korean text. The task is to structure first-pass review without automating investment judgment."
      />

      <div className="problem-grid">
        <blockquote className="research-question">
          <span>Research question</span>
          <p>
            Can a transparent Korean-language NLP workflow connect structured IPO and CB
            screening with passage-level risk triage while keeping every conclusion linked
            to inspectable evidence?
          </p>
        </blockquote>

        <div className="design-principles">
          <article>
            <span>01</span>
            <div>
              <h3>Inspect the path</h3>
              <p>Expose Korean matched phrases and per-label scores, not only the final label.</p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Keep the evidence</h3>
              <p>Keep document, market, transaction type, and passage IDs attached to findings.</p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Measure the misses</h3>
              <p>Compare transparent rules with a document-held-out trained baseline.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
