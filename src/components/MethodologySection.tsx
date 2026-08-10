import { SectionHeading } from './SectionHeading'

const steps = [
  {
    number: '01',
    title: 'Prepare passages',
    copy: 'Clean synthetic disclosure-style text and preserve document, company, date, and passage metadata.',
    output: '30 annotated passages',
  },
  {
    number: '02',
    title: 'Classify transparently',
    copy: 'Apply documented, label-specific terms and deterministic weights to assign one primary risk label.',
    output: 'Label + matched terms',
  },
  {
    number: '03',
    title: 'Retrieve evidence',
    copy: 'Rank passages with TF-IDF and cosine similarity using lexical normalization, without external models.',
    output: 'Top-k evidence list',
  },
  {
    number: '04',
    title: 'Evaluate and report',
    copy: 'Compare predictions with fixed reference labels, inspect the confusion matrix, and assemble an evidence-linked memo.',
    output: 'Metrics + error analysis',
  },
]

export function MethodologySection() {
  return (
    <section className="method-section" id="method">
      <div className="page-shell section-pad">
        <SectionHeading
          eyebrow="02 / Methodology"
          title="A small pipeline designed to be audited."
          description="No generative model, hidden prompt, remote inference, or API key. Memo text is assembled deterministically from fixed templates, and the same functions power the demo and evaluation."
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
            TF-IDF is presented as a lexical evidence-retrieval baseline—not semantic
            understanding. The classifier is a rule-based NLP baseline—not a trained ML model.
          </p>
        </div>
      </div>
    </section>
  )
}
