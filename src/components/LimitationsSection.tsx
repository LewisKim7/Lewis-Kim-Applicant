import { SectionHeading } from './SectionHeading'

const limitations = [
  'The corpus contains only 30 synthetic Korean passages.',
  'Unicode tokenization with limited Korean particle stripping is not a morphological analyzer.',
  'Rules are wording-sensitive and can miss implicit or negated risks.',
  'One primary label cannot represent every overlapping signal.',
  'TF-IDF has limited Korean context and paraphrase understanding.',
  'Reference labels were drafted in the same AI-assisted build process.',
  'The 12-query retrieval diagnostic is closed-corpus and AI-assisted.',
  'Structured CB and IPO rows are fictional workflow demonstrations.',
]

const nextSteps = [
  'Freeze the pipeline and build a permitted Korean disclosure holdout.',
  'Add applicant-reviewed and independent annotations with agreement analysis.',
  'Compare the Unicode token baseline with a Korean morphological analyzer.',
  'Move from single-label to multi-label classification.',
  'Repeat retrieval evaluation with independently judged external queries.',
]

export function LimitationsSection() {
  return (
    <section className="limitations-section" id="limitations">
      <div className="page-shell section-pad">
        <SectionHeading
          eyebrow="07 / Responsible use"
          title="A prototype is useful only when its boundary is visible."
          description="These results describe behavior on a small synthetic Korean sample. They do not establish performance on DART filings, legal reliability, or investment usefulness."
          inverse
        />

        <div className="limitations-grid">
          <div>
            <h3>Current limitations</h3>
            <ul>
              {limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Future improvements</h3>
            <ol>
              {nextSteps.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="independent-note">
          <strong>Independent project note</strong>
          <p>
            Created while preparing for graduate study in artificial intelligence and informed
            by prior Korean IPO and CB workflow concepts. This independent project is not
            affiliated with UT Austin, DART, KRX, or any admissions office. All entities,
            passages, and structured sample rows are fictional.
          </p>
        </div>
      </div>
    </section>
  )
}
