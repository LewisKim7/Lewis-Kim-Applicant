import type { CSSProperties } from 'react'
import { ALL_PASSAGES } from '../data/corpus'
import { classifyPassage } from '../lib'

const SOURCE_URL = 'https://github.com/LewisKim7/Korea-IPO-CB-Risk-Screener'
const TRACE_PASSAGE = (() => {
  const passage = ALL_PASSAGES.find(
    (item) => item.passageId === 'DOC-KR-CB-RESET-001-P01',
  )
  if (!passage) throw new Error('The hero trace passage is missing from the corpus')
  return passage
})()

const TRACE_RESULT = classifyPassage(TRACE_PASSAGE)
const TRACE_SCORES = [
  { label: 'dilution', value: TRACE_RESULT.rawScores['Dilution Risk'] },
  { label: 'market', value: TRACE_RESULT.rawScores['Market Risk'] },
  { label: 'governance', value: TRACE_RESULT.rawScores['Governance Risk'] },
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
          <span>Korean capital markets</span>
          <span aria-hidden="true">/</span>
          <span>Applicant-directed · AI-assisted implementation</span>
        </div>
        <h1 id="hero-title">
          Korea IPO &amp; CB
          <span>Risk Screener</span>
        </h1>
        <p className="hero__deck">
          An application portfolio connecting Korean capital-markets judgment with
          transparent NLP classification, retrieval, and evaluation.
        </p>
        <p className="hero__body">
          Drawing on my work in Korean finance and deep-tech investing, I defined the problem,
          risk taxonomy, product requirements, evaluation questions, and interpretation. Codex
          assisted with synthetic-data drafting, implementation, documentation, and automated
          verification. The result is a reproducible educational prototype—not a production
          investment model.
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
          <span>KOREAN PASSAGE TRACE</span>
          <span className="status-dot">DETERMINISTIC</span>
        </div>
        <div className="signal-console__source">
          <span className="console-index">01</span>
          <div>
            <p className="console-label">Synthetic DART-style passage</p>
            <p className="console-id">{TRACE_PASSAGE.passageId}</p>
            <blockquote>
              “...전환가액은 12,000원에서 8,400원으로... 전환가능 주식수는
              최초 조건보다 약 42.9% 증가...”
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
          <dd>synthetic Korean passages</dd>
        </div>
        <div>
          <dt>07</dt>
          <dd>risk taxonomy labels</dd>
        </div>
        <div>
          <dt>05</dt>
          <dd>synthetic IPO / CB documents</dd>
        </div>
        <div>
          <dt>00</dt>
          <dd>external API keys</dd>
        </div>
      </dl>
    </section>
  )
}
