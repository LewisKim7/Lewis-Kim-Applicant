import { ALL_PASSAGES } from '../data/corpus'
import { RISK_TAXONOMY_BY_LABEL, type RiskLabel } from '../domain'
import { classifyPassage, evaluateClassifier } from '../lib'
import { SectionHeading } from './SectionHeading'

const EVALUATION = evaluateClassifier(ALL_PASSAGES, classifyPassage, {
  maxExamplesPerGroup: 8,
})

const SHORT_LABELS: Readonly<Record<RiskLabel, string>> = {
  'Dilution Risk': 'DIL',
  'Refinancing Risk': 'REF',
  'Liquidity Risk': 'LIQ',
  'Governance Risk': 'GOV',
  'Execution Risk': 'EXE',
  'Market Risk': 'MKT',
  'Low Risk / Informational': 'INFO',
}

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function riskClass(label: RiskLabel): string {
  return `risk-${RISK_TAXONOMY_BY_LABEL[label].id}`
}

export function EvaluationSection() {
  const errorCount = EVALUATION.total - EVALUATION.correct

  return (
    <section className="evaluation-section page-shell section-pad" id="evaluation">
      <SectionHeading
        eyebrow="05 / Evaluation"
        title="The errors are part of the result."
        description="Predictions are recomputed from the visible rules and compared with 30 fixed reference labels. This is an illustrative closed-set evaluation, not evidence of generalization."
      />

      <div className="evaluation-banner">
        <span>Illustrative baseline only</span>
        <p>
          Synthetic data · AI-assisted reference labels · no train/test claim · no calibrated confidence
        </p>
      </div>

      <dl className="evaluation-metrics">
        <div>
          <dt>{percent(EVALUATION.accuracy)}</dt>
          <dd>sample accuracy</dd>
        </div>
        <div>
          <dt>
            {EVALUATION.correct}/{EVALUATION.total}
          </dt>
          <dd>correct passages</dd>
        </div>
        <div>
          <dt>{percent(EVALUATION.macroRecall)}</dt>
          <dd>macro recall · 7 labels</dd>
        </div>
        <div>
          <dt>{String(errorCount).padStart(2, '0')}</dt>
          <dd>errors inspected</dd>
        </div>
      </dl>

      <div className="evaluation-grid">
        <div className="label-performance">
          <header>
            <div>
              <span className="demo-label">Per-label behavior</span>
              <h3>Recall and sample count</h3>
            </div>
            <span>Actual labels</span>
          </header>
          <div className="label-performance__rows">
            {EVALUATION.labels.map((label) => {
              const metric = EVALUATION.perLabel[label]
              return (
                <div key={label}>
                  <span className={`risk-pill ${riskClass(label)}`}>{label}</span>
                  <meter min="0" max="1" value={metric.recall}>
                    {percent(metric.recall)}
                  </meter>
                  <strong>{percent(metric.recall)}</strong>
                  <small>n={metric.actualCount}</small>
                </div>
              )
            })}
          </div>
        </div>

        <div className="confusion-panel">
          <header>
            <div>
              <span className="demo-label">Confusion matrix</span>
              <h3>Reference label → prediction</h3>
            </div>
            <span>Rows actual · columns predicted</span>
          </header>
          <div
            className="confusion-scroll"
            role="region"
            tabIndex={0}
            aria-label="Scrollable confusion matrix"
          >
            <table className="confusion-matrix">
              <caption>Counts by actual and predicted risk label</caption>
              <thead>
                <tr>
                  <th scope="col">Actual</th>
                  {EVALUATION.labels.map((label) => (
                    <th scope="col" title={label} key={label}>
                      {SHORT_LABELS[label]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EVALUATION.labels.map((actualLabel, rowIndex) => (
                  <tr key={actualLabel}>
                    <th scope="row" title={actualLabel}>
                      {SHORT_LABELS[actualLabel]}
                    </th>
                    {EVALUATION.labels.map((predictedLabel, columnIndex) => {
                      const value = EVALUATION.confusionMatrix[rowIndex]?.[columnIndex] ?? 0
                      return (
                        <td
                          className={
                            rowIndex === columnIndex && value > 0
                              ? 'is-correct'
                              : value > 0
                                ? 'is-error'
                                : undefined
                          }
                          key={predictedLabel}
                        >
                          {value}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="error-analysis">
        <header>
          <span className="demo-label">Error analysis</span>
          <h3>{EVALUATION.errorAnalysis}</h3>
        </header>
        <div className="error-examples">
          {EVALUATION.errorExamples.length ? (
            EVALUATION.errorExamples.map((example) => (
              <article key={example.passageId}>
                <div>
                  <span>{example.passageId}</span>
                  <span>{percent(example.signalScore)} heuristic</span>
                </div>
                <p>{example.text}</p>
                <footer>
                  <span>
                    Reference: <strong>{example.actualLabel}</strong>
                  </span>
                  <span aria-hidden="true">→</span>
                  <span>
                    Baseline: <strong>{example.predictedLabel}</strong>
                  </span>
                </footer>
              </article>
            ))
          ) : (
            <article>
              <p>
                No errors were observed in this tiny sample. That result would still not
                establish generalization and should trigger a harder benchmark.
              </p>
            </article>
          )}
        </div>
      </div>

      <details className="metric-notes">
        <summary>Metric definitions and caveats</summary>
        <ul>
          {EVALUATION.metricNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
          <li>
            Rules and sample language were developed in the same educational project, so
            benchmark leakage is possible.
          </li>
        </ul>
      </details>
    </section>
  )
}
