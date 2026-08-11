import type { CSSProperties } from 'react'
import { ALL_PASSAGES } from '../data/corpus'
import {
  classifyPassage,
  matchedTermEnglishGloss,
} from '../lib'
import { EnglishPassageSummary } from './EnglishPassageSummary'
import { ProfileSection } from './ProfileSection'
import { RiskOverview } from './RiskOverview'

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

        <ProfileSection />
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
            <blockquote lang="ko">
              “...전환가액은 12,000원에서 8,400원으로... 전환가능 주식수는
              최초 조건보다 약 42.9% 증가...”
            </blockquote>
            <EnglishPassageSummary summary={TRACE_PASSAGE.annotationRationale} compact />
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

      <RiskOverview />
    </section>
  )
}
