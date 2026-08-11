import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { ALL_PASSAGES, DOCUMENTS } from '../data/corpus'
import { RISK_LABELS, RISK_TAXONOMY_BY_LABEL, type RiskLabel } from '../domain'
import {
  analyzePassages,
  createTfidfIndex,
  generateRiskMemo,
  matchedTermEnglishGloss,
  type AnalyzedPassage,
  type RiskMemo,
} from '../lib'
import { EnglishPassageSummary } from './EnglishPassageSummary'
import { SectionHeading } from './SectionHeading'

const QUERY_SUGGESTIONS = [
  '전환가액 리픽싱',
  '조기상환청구권 상환 재원',
  '공모자금 사용',
  '특수관계인 이해상충',
  '운전자금 부족',
] as const

const INITIAL_DOCUMENT = DOCUMENTS[0]
if (!INITIAL_DOCUMENT) throw new Error('The demo requires at least one synthetic document')

const RETRIEVAL_INDEX = createTfidfIndex(ALL_PASSAGES)

function riskClass(label: RiskLabel): string {
  return `risk-${RISK_TAXONOMY_BY_LABEL[label].id}`
}

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function EvidenceView({
  analyses,
  highlightedPassageId,
}: {
  analyses: readonly AnalyzedPassage[]
  highlightedPassageId: string | null
}) {
  return (
    <div className="evidence-table-wrap">
      <table className="evidence-table">
        <caption>
          Predicted labels and Korean evidence for the selected synthetic document. Signal
          scores are rule-strength heuristics, not probabilities.
        </caption>
        <thead>
          <tr>
            <th scope="col">Passage</th>
            <th scope="col">Baseline result</th>
            <th scope="col">Matched terms · English gloss</th>
            <th scope="col">Transparent rule trace</th>
          </tr>
        </thead>
        <tbody>
          {analyses.map(({ passage, classification }) => (
            <tr
              className={passage.passageId === highlightedPassageId ? 'is-highlighted' : undefined}
              id={`evidence-${passage.passageId}`}
              key={passage.passageId}
              tabIndex={passage.passageId === highlightedPassageId ? -1 : undefined}
            >
              <td data-label="Passage">
                <span className="passage-id">{passage.passageId}</span>
                <p lang="ko">{passage.text}</p>
                <EnglishPassageSummary summary={passage.annotationRationale} />
              </td>
              <td data-label="Baseline result">
                <span className={`risk-pill ${riskClass(classification.predictedLabel)}`}>
                  {classification.predictedLabel}
                </span>
                <div className="signal-meter">
                  <meter min="0" max="1" value={classification.signalScore}>
                    {percent(classification.signalScore)}
                  </meter>
                  <span>{percent(classification.signalScore)} heuristic</span>
                </div>
              </td>
              <td data-label="Matched terms">
                <div className="keyword-list">
                  {classification.matchedKeywords.length ? (
                    classification.matchedKeywords.slice(0, 4).map((keyword) => {
                      const englishGloss = matchedTermEnglishGloss(keyword)
                      return (
                        <code
                          aria-label={englishGloss ? `${keyword}: ${englishGloss}` : keyword}
                          key={keyword}
                        >
                          <span lang="ko">{keyword}</span>
                          {englishGloss ? <small lang="en">{englishGloss}</small> : null}
                        </code>
                      )
                    })
                  ) : (
                    <span className="no-match">No configured risk phrase</span>
                  )}
                </div>
              </td>
              <td data-label="Rule trace">
                <details className="rule-trace">
                  <summary>Inspect rule trace</summary>
                  <p>{classification.explanation}</p>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MemoView({ memo }: { memo: RiskMemo }) {
  return (
    <article className="memo-view">
      <header className="memo-view__header">
        <div>
          <span>Generated locally</span>
          <h3>{memo.title}</h3>
        </div>
        <span>{memo.citedPassageIds.length} cited passage IDs</span>
      </header>

      <section>
        <h4>Executive Summary</h4>
        <p>{memo.executiveSummary}</p>
      </section>

      <section>
        <h4>Key Risk Signals</h4>
        <div className="memo-signals">
          {memo.keyRiskSignals.length ? (
            memo.keyRiskSignals.map((signal) => (
              <article key={signal.label}>
                <span className={`risk-pill ${riskClass(signal.label)}`}>{signal.label}</span>
                <p>{signal.summary}</p>
              </article>
            ))
          ) : (
            <p>No configured risk signal was detected.</p>
          )}
        </div>
      </section>

      <div className="memo-columns">
        <section>
          <h4>Investment Implications</h4>
          <ul>
            {memo.investmentImplications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4>Open Questions</h4>
          <ul>
            {memo.openQuestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="memo-view__footer">
        <strong>Limitations carried into the memo</strong>
        <p>{memo.limitations[0]}</p>
      </footer>
    </article>
  )
}

export function DemoDashboard() {
  const [selectedDocumentId, setSelectedDocumentId] = useState(INITIAL_DOCUMENT.documentId)
  const [query, setQuery] = useState('전환가액 리픽싱')
  const [activeView, setActiveView] = useState<'evidence' | 'memo'>('evidence')
  const [highlightedPassageId, setHighlightedPassageId] = useState<string | null>(null)
  const deferredQuery = useDeferredValue(query)

  const selectedDocument =
    DOCUMENTS.find((document) => document.documentId === selectedDocumentId) ??
    INITIAL_DOCUMENT
  const analyses = useMemo(
    () => analyzePassages(selectedDocument.passages),
    [selectedDocument],
  )
  const memo = useMemo(
    () =>
      generateRiskMemo(selectedDocument.passages, {
        title: `${selectedDocument.companyName} — Korean IPO/CB Evidence Memo`,
      }),
    [selectedDocument],
  )
  const retrievalResults = useMemo(
    () => RETRIEVAL_INDEX.search(deferredQuery, { topK: 5 }),
    [deferredQuery],
  )
  const labelCounts = useMemo(
    () =>
      Object.fromEntries(
        RISK_LABELS.map((label) => [
          label,
          analyses.filter(({ classification }) => classification.predictedLabel === label).length,
        ]),
      ) as Record<RiskLabel, number>,
    [analyses],
  )

  useEffect(() => {
    if (!highlightedPassageId || activeView !== 'evidence') return

    const frameId = requestAnimationFrame(() => {
      const target = document.getElementById(`evidence-${highlightedPassageId}`)
      if (!target) return

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      target.focus({ preventScroll: true })
      target.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'center',
      })
    })

    return () => cancelAnimationFrame(frameId)
  }, [activeView, highlightedPassageId, selectedDocumentId])

  function selectSearchResult(documentId: string, passageId: string) {
    setSelectedDocumentId(documentId)
    setHighlightedPassageId(passageId)
    setActiveView('evidence')
  }

  return (
    <section className="prototype-section page-shell section-pad" id="prototype">
      <SectionHeading
        eyebrow="04 / Interactive prototype"
        title="Search, classify, and trace every result."
        description="Choose a fictional Korean filing. The interface shows what matched, why the phrase matters, and where the evidence came from."
      />

      <div className="dataset-strip" role="group" aria-label="Synthetic document library">
        {DOCUMENTS.map((document) => (
          <button
            className={document.documentId === selectedDocument.documentId ? 'is-selected' : undefined}
            key={document.documentId}
            onClick={() => {
              setSelectedDocumentId(document.documentId)
              setHighlightedPassageId(null)
            }}
            type="button"
          >
            <span>{document.documentId}</span>
            <strong>{document.documentType}</strong>
            <small>{document.market} · {document.companyName}</small>
          </button>
        ))}
      </div>

      <div className="demo-frame">
        <header className="demo-frame__header">
          <div>
            <span className="status-dot">LOCAL ANALYSIS</span>
            <span>KOREAN SYNTHETIC DATA</span>
          </div>
          <span>NO LIVE DART CALL · NO API KEY</span>
        </header>

        <div className="demo-controls">
          <div className="document-control">
            <label htmlFor="document-select">Source document</label>
            <select
              id="document-select"
              value={selectedDocument.documentId}
              onChange={(event) => {
                setSelectedDocumentId(event.currentTarget.value)
                setHighlightedPassageId(null)
              }}
            >
              {DOCUMENTS.map((document) => (
                <option key={document.documentId} value={document.documentId}>
                  {document.companyName} — {document.documentType}
                </option>
              ))}
            </select>
            <p>
              {selectedDocument.documentId} · {selectedDocument.date} ·{' '}
              {selectedDocument.market} · {selectedDocument.passages.length} passages
            </p>
          </div>

          <div className="search-control">
            <label htmlFor="evidence-query">Korean TF-IDF evidence retrieval</label>
            <div className="search-input">
              <input
                id="evidence-query"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                aria-describedby="retrieval-note"
              />
              <span aria-hidden="true">⌕</span>
            </div>
            <p id="retrieval-note">
              TF-IDF baseline · ranks passages that share words with the query; it does not
              understand meaning like a person
            </p>
          </div>
        </div>

        <div className="query-chips" role="group" aria-label="Suggested evidence queries">
          {QUERY_SUGGESTIONS.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => setQuery(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>

        <div className="demo-overview">
          <div className="document-summary">
            <span className="demo-label">Selected document</span>
            <h3>{selectedDocument.companyName}</h3>
            <p>
              {selectedDocument.market} · {selectedDocument.workflow}
            </p>
            <div className="document-keyfacts">
              {selectedDocument.keyFacts.map((fact) => (
                <div key={fact.label}>
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </div>
              ))}
            </div>
            <div className="predicted-mix">
              {RISK_LABELS.filter((label) => labelCounts[label] > 0).map((label) => (
                <span className={`risk-pill ${riskClass(label)}`} key={label}>
                  {label} <strong>{labelCounts[label]}</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="retrieval-panel">
            <header>
              <span className="demo-label">Top evidence across corpus</span>
              <span>{retrievalResults.length} results</span>
            </header>
            <ol>
              {retrievalResults.length ? (
                retrievalResults.map((result) => (
                  <li key={result.passage.passageId}>
                    <button
                      type="button"
                      onClick={() =>
                        selectSearchResult(result.passage.documentId, result.passage.passageId)
                      }
                    >
                      <span className="retrieval-rank">{String(result.rank).padStart(2, '0')}</span>
                      <span>
                        <strong>{result.passage.passageId}</strong>
                        <small className="retrieval-passage" lang="ko">
                          {result.passage.text}
                        </small>
                        <EnglishPassageSummary
                          summary={result.passage.annotationRationale}
                          compact
                        />
                      </span>
                      <span className="similarity-score">{percent(result.score)}</span>
                    </button>
                  </li>
                ))
              ) : (
                <li className="empty-result">No lexical match. Try a suggested query.</li>
              )}
            </ol>
          </div>
        </div>

        <div className="analysis-tabs">
          <div className="analysis-tablist" role="group" aria-label="Analysis view">
            <button
              aria-pressed={activeView === 'evidence'}
              type="button"
              onClick={() => setActiveView('evidence')}
            >
              Evidence table
            </button>
            <button
              aria-pressed={activeView === 'memo'}
              type="button"
              onClick={() => setActiveView('memo')}
            >
              Generated memo
            </button>
          </div>
          <span>Every visible Korean passage includes a concise English summary.</span>
        </div>

        <div className="analysis-view" aria-live="polite">
          {activeView === 'evidence' ? (
            <EvidenceView analyses={analyses} highlightedPassageId={highlightedPassageId} />
          ) : (
            <MemoView memo={memo} />
          )}
        </div>
      </div>
    </section>
  )
}
