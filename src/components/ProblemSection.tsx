import { SectionHeading } from './SectionHeading'

export function ProblemSection() {
  return (
    <section className="problem-section page-shell section-pad" id="problem">
      <SectionHeading
        eyebrow="02 / Problem framing"
        title="From deal terms to traceable evidence."
        description="IPO and CB risks are scattered across structured terms and dense Korean text. This prototype organizes first-pass review without automating investment judgment."
      />

      <div className="problem-grid">
        <blockquote className="research-question">
          <span>Research question</span>
          <p>
            Can transparent Korean NLP connect IPO and CB screens to inspectable passage-level
            evidence?
          </p>
        </blockquote>

        <div className="design-principles">
          <article>
            <span>01</span>
            <div>
              <h3>Inspect the path</h3>
              <p>Expose Korean matched phrases, English glosses, and per-label scores—not only the final label.</p>
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
