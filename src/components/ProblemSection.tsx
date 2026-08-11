import { SectionHeading } from './SectionHeading'

export function ProblemSection() {
  return (
    <section className="problem-section page-shell section-pad" id="problem">
      <SectionHeading
        eyebrow="02 / Problem framing"
        title="From deal terms to traceable evidence."
        description="In plain English: what happened, why might it matter, and which sentence supports that conclusion? The prototype organizes those questions without making an investment decision."
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
              <p>Display the Korean phrase, its English meaning, and the rule that matched it.</p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Keep the evidence</h3>
              <p>Every finding links back to the document and exact passage that produced it.</p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Measure the misses</h3>
              <p>Keep wrong classifications visible instead of presenting one flattering score.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
