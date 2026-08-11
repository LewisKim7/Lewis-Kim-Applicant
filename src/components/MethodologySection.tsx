import { SectionHeading } from './SectionHeading'

const steps = [
  {
    number: '01',
    title: 'Structure the event',
    copy: 'Use the IPO report and bond finder to identify cases that deserve a closer look.',
    output: 'A focused review question',
  },
  {
    number: '02',
    title: 'Prepare Korean passages',
    copy: 'Clean the text and divide each fictional filing into six short, source-labeled passages.',
    output: '30 traceable passages',
  },
  {
    number: '03',
    title: 'Classify and retrieve',
    copy: 'Match transparent phrases, retrieve related passages, and keep a plain-English reason beside the Korean source.',
    output: 'Risk question + evidence',
  },
  {
    number: '04',
    title: 'Evaluate and report',
    copy: 'Hide one whole document from the learned baseline, inspect errors, and generate a memo with passage citations.',
    output: 'Results + visible mistakes',
  },
]

export function MethodologySection() {
  return (
    <section className="method-section" id="method">
      <div className="page-shell section-pad">
        <SectionHeading
          eyebrow="03 / Methodology"
          title="From a market question to an evidence-linked answer."
          description="The workflow turns numbers and Korean text into inspectable results. It runs locally and needs no API key."
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
            The interactive tool uses transparent phrase rules. A separate basic machine-learning
            experiment tests whether patterns learned from four documents work on a fifth.
            Neither score is an investment probability.
          </p>
        </div>
      </div>
    </section>
  )
}
