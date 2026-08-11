import type { CSSProperties } from 'react'
import { ALL_PASSAGES } from '../data/corpus'
import { RETRIEVAL_JUDGMENTS } from '../data/retrieval-judgments'
import { RISK_TAXONOMY_BY_LABEL, type RiskLabel } from '../domain'
import {
  classifyPassage,
  createTfidfIndex,
  evaluateClassifier,
  evaluateDocumentHeldOutLogisticRegression,
  evaluateRetrieval,
} from '../lib'
import { SectionHeading } from './SectionHeading'

const RULE_EVALUATION = evaluateClassifier(ALL_PASSAGES, classifyPassage, {
  maxExamplesPerGroup: 8,
})
const ML_EVALUATION = evaluateDocumentHeldOutLogisticRegression(ALL_PASSAGES)
const RETRIEVAL_EVALUATION = evaluateRetrieval(
  createTfidfIndex(ALL_PASSAGES),
  RETRIEVAL_JUDGMENTS,
  { k: 3 },
)
const RETRIEVAL_CASE_IDS = new Set(['Q03', 'Q06', 'Q12'])
const RETRIEVAL_CASES = RETRIEVAL_EVALUATION.queries.filter(({ queryId }) =>
  RETRIEVAL_CASE_IDS.has(queryId),
)
const PROTOCOL_GAP = Math.abs(
  ML_EVALUATION.accuracy - RULE_EVALUATION.accuracy,
)

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

function percentagePoints(value: number): string {
  return `${(value * 100).toFixed(1)} percentage points`
}

function riskClass(label: RiskLabel): string {
  return `risk-${RISK_TAXONOMY_BY_LABEL[label].id}`
}

function recallBarStyle(value: number): CSSProperties {
  return { '--recall-size': `${value * 100}%` } as CSSProperties
}

interface ConfusionMatrixProps {
  readonly labels: readonly RiskLabel[]
  readonly matrix: readonly (readonly number[])[]
  readonly caption: string
}

function ConfusionMatrix({ labels, matrix, caption }: ConfusionMatrixProps) {
  return (
    <div
      className="confusion-scroll"
      role="region"
      tabIndex={0}
      aria-label={`Scrollable ${caption.toLocaleLowerCase('en-US')}`}
    >
      <table className="confusion-matrix">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Actual</th>
            {labels.map((label) => (
              <th scope="col" title={label} key={label}>
                {SHORT_LABELS[label]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((actualLabel, rowIndex) => (
            <tr key={actualLabel}>
              <th scope="row" title={actualLabel}>
                {SHORT_LABELS[actualLabel]}
              </th>
              {labels.map((predictedLabel, columnIndex) => {
                const value = matrix[rowIndex]?.[columnIndex] ?? 0
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
  )
}

function RecallComparisonChart() {
  return (
    <figure className="recall-comparison">
      <figcaption>
        <div>
          <span className="demo-label">Per-label diagnostic</span>
          <h3>Recall by risk label</h3>
        </div>
        <p>Solid · document-held-out ML &nbsp; Outline · closed-corpus rules</p>
      </figcaption>

      <ul>
        {ML_EVALUATION.labels.map((label) => {
          const mlMetric = ML_EVALUATION.perLabel[label]
          const ruleMetric = RULE_EVALUATION.perLabel[label]
          return (
            <li className={label === 'Liquidity Risk' ? 'is-weakest' : undefined} key={label}>
              <div className="recall-comparison__label">
                <span>{label}</span>
                <small>n={mlMetric.actualCount}</small>
              </div>
              <div className="recall-comparison__lane">
                <span>ML</span>
                <i aria-hidden="true"><i style={recallBarStyle(mlMetric.recall)} /></i>
                <strong>{percent(mlMetric.recall)}</strong>
              </div>
              <div className="recall-comparison__lane recall-comparison__lane--rule">
                <span>Rules</span>
                <i aria-hidden="true"><i style={recallBarStyle(ruleMetric.recall)} /></i>
                <strong>{percent(ruleMetric.recall)}</strong>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="recall-comparison__note">
        Liquidity is the visible failure: the held-out model recovers only 1 of 4 reference
        passages. Protocols differ, so bar shape is diagnostic—not a model ranking.
      </p>
    </figure>
  )
}

export function EvaluationSection() {
  return (
    <section className="evaluation-section page-shell section-pad" id="evaluation">
      <SectionHeading
        eyebrow="06 / Evaluation"
        title="The split matters more than the score."
        description="A trained Korean TF-IDF logistic-regression baseline is tested with one entire synthetic document held out at a time. The rules remain a closed-corpus sanity check. Because the protocols differ, their percentages are not a head-to-head model ranking."
      />

      <div className="evaluation-banner">
        <span>Document-held-out development diagnostic</span>
        <p>
          30 synthetic passages · AI-assisted labels · 5 document folds · no external-performance claim
        </p>
      </div>

      <dl className="evaluation-metrics">
        <div>
          <dt>{percent(ML_EVALUATION.accuracy)}</dt>
          <dd>out-of-fold accuracy</dd>
        </div>
        <div>
          <dt>
            {ML_EVALUATION.correct}/{ML_EVALUATION.total}
          </dt>
          <dd>held-out predictions</dd>
        </div>
        <div>
          <dt>{percent(ML_EVALUATION.macroRecall)}</dt>
          <dd>macro recall · 7 labels</dd>
        </div>
        <div>
          <dt>05</dt>
          <dd>document-level folds</dd>
        </div>
      </dl>

      <div className="evaluation-visual-grid">
        <RecallComparisonChart />

        <aside className="evaluation-protocols" aria-label="Evaluation protocol boundaries">
          <article className="evaluation-protocols__primary">
            <span>Primary diagnostic</span>
            <strong>{percent(ML_EVALUATION.accuracy)}</strong>
            <h3>TF-IDF + logistic regression</h3>
            <p>5 document folds · 24 train / 6 test · train-only vocabulary and IDF</p>
          </article>
          <article>
            <span>Sanity check</span>
            <strong>{percent(RULE_EVALUATION.accuracy)}</strong>
            <h3>Weighted phrase rules</h3>
            <p>No split · fixed inspectable rules · same development corpus</p>
          </article>
          <p>
            The {percentagePoints(PROTOCOL_GAP)} gap is not evidence that either baseline is
            superior. Both remain synthetic development diagnostics, not external validation.
          </p>
        </aside>
      </div>

      <div className="evaluation-grid evaluation-grid--heldout">
        <div className="fold-panel">
          <header>
            <div>
              <span className="demo-label">Cross-validation trace</span>
              <h3>One unseen document per fold</h3>
            </div>
            <span>24 train · 6 test</span>
          </header>
          <div
            className="fold-table-wrap"
            role="region"
            aria-label="Scrollable document-level cross-validation results"
            tabIndex={0}
          >
            <table className="fold-table">
              <caption>Leave-one-document-out fold results</caption>
              <thead>
                <tr>
                  <th scope="col">Held-out document</th>
                  <th scope="col">Vocabulary</th>
                  <th scope="col">Correct</th>
                  <th scope="col">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {ML_EVALUATION.folds.map((fold) => (
                  <tr key={fold.holdoutDocumentId}>
                    <th scope="row">{fold.holdoutDocumentId}</th>
                    <td>{fold.vocabularySize}</td>
                    <td>
                      {fold.correct}/{fold.testCount}
                    </td>
                    <td>{percent(fold.accuracy)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="confusion-panel">
          <header>
            <div>
              <span className="demo-label">Out-of-fold confusion matrix</span>
              <h3>Reference label → ML prediction</h3>
            </div>
            <span>Rows actual · columns predicted</span>
          </header>
          <ConfusionMatrix
            labels={ML_EVALUATION.labels}
            matrix={ML_EVALUATION.confusionMatrix}
            caption="Out-of-fold counts by actual and predicted risk label"
          />
        </div>
      </div>

      <div className="error-analysis error-analysis--ml">
        <header>
          <span className="demo-label">Held-out error inspection</span>
          <h3>
            {ML_EVALUATION.errorExamples.length} of {ML_EVALUATION.total} unseen-document
            passages were misclassified.
          </h3>
          <p>
            The examples below are not patched away. They expose sparse vocabulary, label
            overlap, and the weakness of learning seven classes from only 24 passages per fold.
            Liquidity Risk recall is only{' '}
            {percent(ML_EVALUATION.perLabel['Liquidity Risk'].recall)} (
            {ML_EVALUATION.perLabel['Liquidity Risk'].correctCount}/
            {ML_EVALUATION.perLabel['Liquidity Risk'].actualCount}), a weakness hidden by the
            headline accuracy.
          </p>
        </header>
        <div className="error-examples">
          {ML_EVALUATION.errorExamples.slice(0, 4).map((example) => (
            <article key={example.passageId}>
              <div>
                <span>{example.passageId}</span>
                <span>{percent(example.modelScore)} uncalibrated score</span>
              </div>
              <p>{example.text}</p>
              {example.leadingFeatures.length ? (
                <small>
                  Leading terms: {example.leadingFeatures.map((item) => item.term).join(', ')}
                </small>
              ) : null}
              <footer>
                <span>
                  Reference: <strong>{example.actualLabel}</strong>
                </span>
                <span aria-hidden="true">→</span>
                <span>
                  ML baseline: <strong>{example.predictedLabel}</strong>
                </span>
              </footer>
            </article>
          ))}
        </div>
      </div>

      <section className="retrieval-evaluation" aria-labelledby="retrieval-evaluation-title">
        <header className="retrieval-evaluation__header">
          <div>
            <span className="demo-label">Closed-corpus retrieval diagnostic</span>
            <h3 id="retrieval-evaluation-title">Does lexical search return the intended evidence?</h3>
          </div>
          <p>
            12 AI-assisted Korean queries · graded relevance 1–2 · same 30-passage corpus ·
            not held out
          </p>
        </header>

        <dl className="retrieval-evaluation__metrics">
          <div>
            <dt>{percent(RETRIEVAL_EVALUATION.meanPrecisionAtK)}</dt>
            <dd>mean Precision@3</dd>
          </div>
          <div>
            <dt>{percent(RETRIEVAL_EVALUATION.meanRecallAtK)}</dt>
            <dd>mean Recall@3</dd>
          </div>
          <div>
            <dt>{percent(RETRIEVAL_EVALUATION.meanReciprocalRankAtK)}</dt>
            <dd>MRR@3</dd>
          </div>
          <div>
            <dt>{percent(RETRIEVAL_EVALUATION.meanNdcgAtK)}</dt>
            <dd>nDCG@3</dd>
          </div>
        </dl>

        <div className="retrieval-cases">
          {RETRIEVAL_CASES.map((item) => (
            <article className={item.firstRelevantRank ? undefined : 'is-failure'} key={item.queryId}>
              <div className="retrieval-case__meta">
                <span>{item.queryId}</span>
                <span>
                  {item.relevantRetrieved}/{item.relevantCount} relevant returned
                </span>
              </div>
              <h4 lang="ko">{item.query}</h4>
              <p>{item.intent}</p>
              <footer>
                <strong>
                  {item.firstRelevantRank
                    ? `First relevant result at rank ${item.firstRelevantRank}`
                    : 'No relevant result in the top three'}
                </strong>
                <span>
                  {item.rankedPassages[0]?.passageId ?? 'No lexical match'}
                </span>
              </footer>
            </article>
          ))}
        </div>

        <p className="retrieval-evaluation__note">
          Q12 deliberately paraphrases the corpus wording and returns no lexical match. The
          visible failure illustrates TF-IDF's synonym and context limits; it was retained
          instead of tuning the query set around the system.
        </p>
      </section>

      <details className="closed-set-details">
        <summary>
          Inspect the {percent(RULE_EVALUATION.accuracy)} closed-corpus rule sanity check
          <span>
            {RULE_EVALUATION.correct}/{RULE_EVALUATION.total} correct ·{' '}
            {percent(RULE_EVALUATION.macroRecall)} macro recall
          </span>
        </summary>
        <div className="evaluation-grid">
          <div className="label-performance">
            <header>
              <div>
                <span className="demo-label">Rule behavior</span>
                <h3>Recall and sample count</h3>
              </div>
              <span>Actual labels</span>
            </header>
            <div className="label-performance__rows">
              {RULE_EVALUATION.labels.map((label) => {
                const metric = RULE_EVALUATION.perLabel[label]
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
                <span className="demo-label">Closed-corpus confusion matrix</span>
                <h3>Reference label → rule prediction</h3>
              </div>
              <span>Rows actual · columns predicted</span>
            </header>
            <ConfusionMatrix
              labels={RULE_EVALUATION.labels}
              matrix={RULE_EVALUATION.confusionMatrix}
              caption="Closed-corpus counts by actual and predicted risk label"
            />
          </div>
        </div>

        <div className="rule-error-strip">
          {RULE_EVALUATION.errorExamples.map((example) => (
            <article key={example.passageId}>
              <span>{example.passageId}</span>
              <p>{example.text}</p>
              <small>
                {example.actualLabel} → {example.predictedLabel}
              </small>
            </article>
          ))}
        </div>
      </details>

      <details className="metric-notes">
        <summary>Metric definitions, locked configuration, and caveats</summary>
        <ul>
          <li>{ML_EVALUATION.protocolNote}</li>
          <li>
            The trained baseline uses unigram TF-IDF, L2-normalized vectors, full-batch
            multinomial logistic regression, {ML_EVALUATION.options.epochs} epochs, learning
            rate {ML_EVALUATION.options.learningRate}, and L2 penalty{' '}
            {ML_EVALUATION.options.l2Penalty}.
          </li>
          <li>{ML_EVALUATION.scoreNote}</li>
          <li>
            Macro recall is the unweighted mean of recall across the seven represented labels.
          </li>
          <li>
            The 30 labels were drafted in the same AI-assisted project and were not
            independently adjudicated.
          </li>
          <li>{RETRIEVAL_EVALUATION.protocolNote}</li>
          <li>
            Configuration choices were explored during development. New, independently
            labeled data is required for a confirmatory result.
          </li>
        </ul>
      </details>
    </section>
  )
}
