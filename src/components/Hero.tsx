import type { CSSProperties } from 'react'
import { ALL_PASSAGES } from '../data/corpus'
import { classifyPassage } from '../lib'

const SOURCE_URL = 'https://github.com/LewisKim7/AI-Disclosure-Risk-Screener'
const TRACE_PASSAGE = (() => {
  const passage = ALL_PASSAGES.find((item) => item.passageId === 'DOC-CB-001-P02')
  if (!passage) throw new Error('The hero trace passage is missing from the corpus')
  return passage
})()

const TRACE_RESULT = classifyPassage(TRACE_PASSAGE)
const TRACE_SCORES = [
  { label: 'refinancing', value: TRACE_RESULT.rawScores['Refinancing Risk'] },
  { label: 'liquidity', value: TRACE_RESULT.rawScores['Liquidity Risk'] },
  { label: 'execution', value: TRACE_RESULT.rawScores['Execution Risk'] },
] as const
const MAX_TRACE_SCORE = Math.max(...TRACE_SCORES.map(({ value }) => value), 1)

function traceBarStyle(value: number): CSSProperties {
  return {
    '--score-width': `${(value / MAX_TRACE_SCORE) * 84}%`,
  } as CSSProperties
}

export function Hero() {
  return (
    <section className="hero page-shell" aria-labelledby="hero-title">
      <div className="hero__copy">
        <div className="hero__kicker">
          <span>Independent NLP project</span>
          <span aria-hidden="true">/</span>
          <span>2026</span>
        </div>
        <h1 id="hero-title">
          AI Disclosure
          <span>Risk Screener</span>
        </h1>
        <p className="hero__deck">
          A transparent NLP prototype for identifying and organizing risk signals in
          disclosure-style and IPO-style passages.
        </p>
        <p className="hero__body">
          Directed by a finance and deep-tech investment professional preparing for graduate
          study, with AI-assisted implementation. Every classification exposes its matched
          terms, supporting passage, and limitations.
        </p>
        <div className="hero__actions">
          <a className="button button--primary" href="#prototype">
            Explore the prototype
            <span aria-hidden="true">↓</span>
          </a>
          <a className="button button--secondary" href={SOURCE_URL} target="_blank" rel="noreferrer">
            View source &amp; docs
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div
        className="signal-console"
        role="region"
        aria-label="Illustrative classification trace"
      >
        <div className="signal-console__topbar">
          <span>PASSAGE TRACE</span>
          <span className="status-dot">DETERMINISTIC</span>
        </div>
        <div className="signal-console__source">
          <span className="console-index">01</span>
          <div>
            <p className="console-label">Synthetic source passage</p>
            <p className="console-id">{TRACE_PASSAGE.passageId}</p>
            <blockquote>
              “...redeem notes maturing in four months... no committed alternative
              financing...”
            </blockquote>
          </div>
        </div>
        <div className="signal-console__scores">
          <span className="console-index">02</span>
          <div className="score-stack">
            {TRACE_SCORES.map(({ label, value }) => (
              <div key={label}>
                <span>{label}</span>
                <span className="score-line" style={traceBarStyle(value)} />
                <strong>{value.toFixed(1)}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="signal-console__result">
          <span className="console-index">03</span>
          <div>
            <p className="console-label">Primary label</p>
            <strong>{TRACE_RESULT.predictedLabel}</strong>
            <p>
              Matched: {TRACE_RESULT.matchedKeywords.join(', ')} ·{' '}
              {(TRACE_RESULT.signalScore * 100).toFixed(1)}% heuristic, not a probability
            </p>
          </div>
        </div>
      </div>

      <dl className="hero-metrics" aria-label="Project scope">
        <div>
          <dt>30</dt>
          <dd>fixed reference annotations</dd>
        </div>
        <div>
          <dt>07</dt>
          <dd>risk taxonomy labels</dd>
        </div>
        <div>
          <dt>05</dt>
          <dd>synthetic document types</dd>
        </div>
        <div>
          <dt>00</dt>
          <dd>external API keys</dd>
        </div>
      </dl>
    </section>
  )
}
