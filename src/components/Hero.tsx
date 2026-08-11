import type { CSSProperties } from 'react'
import { ALL_PASSAGES } from '../data/corpus'
import { FROZEN_MARKET_SNAPSHOT } from '../data/market-snapshot'
import {
  classifyPassage,
  evaluateDocumentHeldOutLogisticRegression,
  matchedTermEnglishGloss,
} from '../lib'

const SOURCE_URL = 'https://github.com/LewisKim7/lewis-kim-applicant'
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
const TRACE_ENGLISH_GLOSSES = TRACE_RESULT.matchedKeywords.map(
  (keyword) => matchedTermEnglishGloss(keyword) ?? keyword,
)
const TRACE_MOBILE_KEYWORDS = TRACE_RESULT.matchedKeywords.slice(0, 2)
const TRACE_MOBILE_ENGLISH_GLOSSES = TRACE_MOBILE_KEYWORDS.map(
  (keyword) => matchedTermEnglishGloss(keyword) ?? keyword,
)
const HERO_EVALUATION = evaluateDocumentHeldOutLogisticRegression(ALL_PASSAGES)
const LIQUIDITY_RECALL = HERO_EVALUATION.perLabel['Liquidity Risk']
const IPO_SNAPSHOT = FROZEN_MARKET_SNAPSHOT.ipo
const CB_SNAPSHOT = FROZEN_MARKET_SNAPSHOT.cb

function traceBarStyle(value: number): CSSProperties {
  return {
    '--score-width': `${(value / MAX_TRACE_SCORE) * 84}%`,
  } as CSSProperties
}

function evidenceBarStyle(value: number, total: number): CSSProperties {
  return {
    '--evidence-width': `${(value / total) * 100}%`,
  } as CSSProperties
}

function oneDecimalPercent(value: number, total: number): string {
  return `${((value / total) * 100).toFixed(1)}%`
}

export function Hero() {
  return (
    <section className="hero page-shell" aria-labelledby="hero-title">
      <div className="hero__copy">
        <div className="hero__kicker">
          <span>Korean capital markets</span>
          <span aria-hidden="true">/</span>
          <span>Traceable NLP prototype</span>
        </div>
        <h1 id="hero-title">
          Korea IPO &amp; CB
          <span>Risk Screener</span>
        </h1>
        <p className="hero__deck">
          Screen Korean IPO and CB disclosures, classify risk signals, and trace each finding
          to its source passage.
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
            <p className="signal-console__match">
              <span className="signal-console__match-full">
                Matched (KO): {TRACE_RESULT.matchedKeywords.join(', ')}
              </span>
              <span className="signal-console__match-full">
                English: {TRACE_ENGLISH_GLOSSES.join(', ')}
              </span>
              <span className="signal-console__match-compact">
                Matched (KO): {TRACE_MOBILE_KEYWORDS.join(', ')}
              </span>
              <span className="signal-console__match-compact">
                English: {TRACE_MOBILE_ENGLISH_GLOSSES.join(', ')}
              </span>
              <small className="signal-console__match-full">
                {(TRACE_RESULT.signalScore * 100).toFixed(1)}% heuristic, not a probability
              </small>
              <small className="signal-console__match-compact">
                2 of {TRACE_RESULT.matchedKeywords.length} terms previewed · full bilingual trace
                below · {(TRACE_RESULT.signalScore * 100).toFixed(1)}% heuristic, not a probability
              </small>
            </p>
          </div>
        </div>
      </div>

      <aside className="hero__contribution" aria-label="Applicant and AI contribution disclosure">
        <strong>Applicant-led · AI-assisted</strong>
        <p>
          I framed the finance problem and evaluation; Codex assisted implementation.
          Educational prototype—not an investment model.
        </p>
      </aside>

      <div className="hero-evidence" role="region" aria-label="Visual evidence at a glance">
        <figure className="hero-evidence__item">
          <figcaption>
            <span>Frozen market · IPO</span>
            <strong>
              {IPO_SNAPSHOT.belowOfferCount}/{IPO_SNAPSHOT.companyCount} below offer
            </strong>
          </figcaption>
          <div
            className="hero-evidence__bar"
            style={evidenceBarStyle(IPO_SNAPSHOT.belowOfferCount, IPO_SNAPSHOT.companyCount)}
            aria-hidden="true"
          >
            <i />
          </div>
          <p>
            <b>{oneDecimalPercent(IPO_SNAPSHOT.belowOfferCount, IPO_SNAPSHOT.companyCount)}</b>
            <span>
              +{IPO_SNAPSHOT.averageFirstDayReturnPct}% first day →{' '}
              {IPO_SNAPSHOT.averageCurrentReturnPct}% current
            </span>
          </p>
        </figure>

        <figure className="hero-evidence__item">
          <figcaption>
            <span>Frozen market · CB</span>
            <strong>
              {CB_SNAPSHOT.bothZeroRowCount}/{CB_SNAPSHOT.filingRowCount} strict 0% / 0%
            </strong>
          </figcaption>
          <div
            className="hero-evidence__bar hero-evidence__bar--cb"
            style={evidenceBarStyle(CB_SNAPSHOT.bothZeroRowCount, CB_SNAPSHOT.filingRowCount)}
            aria-hidden="true"
          >
            <i />
          </div>
          <p>
            <b>{oneDecimalPercent(CB_SNAPSHOT.bothZeroRowCount, CB_SNAPSHOT.filingRowCount)}</b>
            <span>
              {CB_SNAPSHOT.bothZeroIssuerCount} issuers · ₩
              {(CB_SNAPSHOT.bothZeroAmountEok / 10_000).toFixed(2)}tn principal
            </span>
          </p>
        </figure>

        <figure className="hero-evidence__item hero-evidence__item--nlp">
          <figcaption>
            <span>Synthetic diagnostic · 5 folds</span>
            <strong>
              {HERO_EVALUATION.correct}/{HERO_EVALUATION.total} held-out correct
            </strong>
          </figcaption>
          <div className="hero-evidence__dual">
            <div>
              <span>Accuracy</span>
              <i
                aria-hidden="true"
                style={evidenceBarStyle(HERO_EVALUATION.correct, HERO_EVALUATION.total)}
              >
                <i />
              </i>
              <b>{oneDecimalPercent(HERO_EVALUATION.correct, HERO_EVALUATION.total)}</b>
            </div>
            <div className="is-weakest">
              <span>Liquidity recall</span>
              <i
                aria-hidden="true"
                style={evidenceBarStyle(
                  LIQUIDITY_RECALL.correctCount,
                  LIQUIDITY_RECALL.actualCount,
                )}
              >
                <i />
              </i>
              <b>{LIQUIDITY_RECALL.correctCount}/{LIQUIDITY_RECALL.actualCount}</b>
            </div>
          </div>
          <p>
            <b>{oneDecimalPercent(LIQUIDITY_RECALL.correctCount, LIQUIDITY_RECALL.actualCount)}</b>
            <span>weakest-label recall · 30 passages · 7 labels</span>
          </p>
        </figure>
      </div>
    </section>
  )
}
