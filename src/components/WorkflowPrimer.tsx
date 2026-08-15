const WORKFLOW_STEPS = [
  {
    number: '01',
    title: 'Korean filing',
    detail: 'Start with an IPO or convertible-bond passage.',
  },
  {
    number: '02',
    title: 'Evidence retrieval',
    detail: 'Find the exact Korean wording that triggered a review.',
  },
  {
    number: '03',
    title: 'Plain-English risk memo',
    detail: 'Explain the possible risk and why an analyst should look closer.',
  },
] as const

export function WorkflowPrimer() {
  return (
    <section className="workflow-primer" aria-labelledby="workflow-primer-title">
      <header>
        <span>How this prototype works</span>
        <h2 id="workflow-primer-title">From Korean filing to a reviewable risk signal.</h2>
      </header>

      <ol>
        {WORKFLOW_STEPS.map((step) => (
          <li key={step.number}>
            <span aria-hidden="true">{step.number}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
