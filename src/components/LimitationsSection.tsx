import { SectionHeading } from './SectionHeading'

const limitations = [
  'The corpus contains only 30 synthetic passages.',
  'Rules are wording-sensitive and can miss implicit risks.',
  'One primary label cannot represent every overlapping signal.',
  'TF-IDF has limited contextual and paraphrase understanding.',
  'Reference labels were drafted in the same AI-assisted build process.',
  'False positives and false negatives are expected.',
]

const nextSteps = [
  'Build a legally permitted public-document corpus.',
  'Add independent annotators and agreement analysis.',
  'Move from single-label to multi-label classification.',
  'Compare rules with logistic regression and language models.',
  'Separate retrieval and classification evaluation sets.',
]

export function LimitationsSection() {
  return (
    <section className="limitations-section" id="limitations">
      <div className="page-shell section-pad">
        <SectionHeading
          eyebrow="06 / Responsible use"
          title="A prototype is useful only when its boundary is visible."
          description="These results describe behavior on a small synthetic sample. They do not establish real-world performance, legal reliability, or investment usefulness."
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
            Created while preparing for graduate study in artificial intelligence. This
            project is not affiliated with, sponsored by, or endorsed by UT Austin or any
            admissions office. All entities and passages are fictional and synthetic.
          </p>
        </div>
      </div>
    </section>
  )
}
