import { SectionHeading } from './SectionHeading'

const steps = [
  {
    number: '01',
    title: 'Structure the event',
    copy: 'Reimplement compact CB rate and issue-size filters plus IPO price-band and return calculations on fictional rows.',
    output: 'CB screen + IPO context',
  },
  {
    number: '02',
    title: 'Prepare Korean passages',
    copy: 'Normalize Korean disclosure-style text while preserving issuer, market, transaction, date, and passage metadata.',
    output: '30 passages + AI-assisted labels',
  },
  {
    number: '03',
    title: 'Classify and retrieve',
    copy: 'Run inspectable weighted rules, a TF-IDF logistic-regression experiment, and lexical cosine retrieval.',
    output: 'Labels + ranked evidence',
  },
  {
    number: '04',
    title: 'Evaluate and report',
    copy: 'Hold out one entire document per ML fold, inspect both baselines, and assemble an evidence-linked memo.',
    output: 'Metrics + memo + errors',
  },
]

export function MethodologySection() {
  return (
    <section className="method-section" id="method">
      <div className="page-shell section-pad">
        <SectionHeading
          eyebrow="03 / Methodology"
          title="From market screen to source-linked memo."
          description="Structured calculations, Korean text processing, both baselines, retrieval, and memo generation run locally without an API key."
          inverse
        />

        <ol className="method-grid">
          {steps.map((step) => (
            <li key={step.number}>
              <span className="method-grid__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
              <span className="method-grid__output">Output · {step.output}</span>
            </li>
          ))}
        </ol>

        <div className="method-note">
          <span>Important distinction</span>
          <p>
            TF-IDF search is lexical retrieval, not semantic understanding. The rule engine
            remains the interactive baseline; logistic regression is a separate trained
            development experiment whose softmax score is not calibrated confidence.
          </p>
        </div>
      </div>
    </section>
  )
}
