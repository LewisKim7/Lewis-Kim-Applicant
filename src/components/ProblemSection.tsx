import { SectionHeading } from './SectionHeading'

export function ProblemSection() {
  return (
    <section className="problem-section page-shell section-pad" id="problem">
      <SectionHeading
        eyebrow="01 / Problem framing"
        title="Risk signals are easy to miss—and easy to overstate."
        description="Dense disclosures mix material risks with routine terms. The task is not to automate judgment, but to make first-pass triage more structured and traceable."
      />

      <div className="problem-grid">
        <blockquote className="research-question">
          <span>Research question</span>
          <p>
            Can a transparent NLP workflow help an analyst identify relevant passages,
            organize them by risk type, and trace every conclusion back to supporting text?
          </p>
        </blockquote>

        <div className="design-principles">
          <article>
            <span>01</span>
            <div>
              <h3>Inspect the path</h3>
              <p>Show matched phrases and per-label rule scores, not only the final label.</p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Keep the evidence</h3>
              <p>Attach supporting evidence and key memo findings to stable passage IDs.</p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Measure the misses</h3>
              <p>Report errors and label-level behavior on the same visible benchmark.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
