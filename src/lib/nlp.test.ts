import { describe, expect, it } from 'vitest'
import {
  RISK_LABELS,
  RISK_TAXONOMY,
  isRiskLabel,
  type DisclosurePassage,
  type RiskLabel,
} from '../domain'
import {
  SIGNAL_SCORE_NOTE,
  classifyPassage,
  classifyRiskText,
} from './classifier'
import { evaluateClassifier } from './evaluation'
import { generateRiskMemo } from './memo'
import {
  cleanDisclosureText,
  normalizeText,
  preprocessText,
  splitIntoPassages,
  tokenize,
} from './preprocessing'
import { createTfidfIndex, searchPassages } from './retrieval'

function passage(
  passageId: string,
  text: string,
  referenceLabel: RiskLabel = 'Low Risk / Informational',
  overrides: Partial<DisclosurePassage> = {},
): DisclosurePassage {
  return {
    documentId: 'DOC-TEST',
    passageId,
    companyName: 'Synthetic Test Company',
    documentType: 'Risk Factor Excerpt',
    date: '2026-01-01',
    text,
    referenceLabel,
    annotationRationale: 'Inline unit-test annotation.',
    ...overrides,
  }
}

describe('risk taxonomy', () => {
  it('defines seven unique labels in a stable order', () => {
    expect(RISK_LABELS).toHaveLength(7)
    expect(new Set(RISK_LABELS).size).toBe(7)
    expect(RISK_TAXONOMY.map((entry) => entry.label)).toEqual(RISK_LABELS)
    expect(RISK_LABELS.at(-1)).toBe('Low Risk / Informational')
  })

  it('narrows only declared labels', () => {
    expect(isRiskLabel('Liquidity Risk')).toBe(true)
    expect(isRiskLabel('High Risk')).toBe(false)
    expect(isRiskLabel(null)).toBe(false)
  })
})

describe('text preprocessing', () => {
  it('cleans typography while preserving paragraph boundaries', () => {
    const input = '  “Price–reset”\tterms\r\n\r\nremain   unchanged.  '
    expect(cleanDisclosureText(input)).toBe(
      '"Price-reset" terms\n\nremain unchanged.',
    )
  })

  it('applies only explicit light lexical normalization', () => {
    expect(
      tokenize('Shares were issued while borrowings were refinanced.'),
    ).toEqual([
      'share',
      'were',
      'issuance',
      'while',
      'borrowing',
      'were',
      'refinance',
    ])
    expect(normalizeText('competing markets and resets')).toBe(
      'competition market and reset',
    )
    expect(
      normalizeText('공모가 공모가가 품목허가 품목허가가 인허가 인허가가'),
    ).toBe('공모가 공모가 품목허가 품목허가 인허가 인허가')
    expect(classifyRiskText('공모가가 하회.').predictedLabel).toBe(
      'Market Risk',
    )
  })

  it('splits deterministically without exceeding the configured target', () => {
    const input = `${'Alpha '.repeat(15)}ends. ${'Beta '.repeat(15)}ends.`
    const first = splitIntoPassages(input, { maxCharacters: 90 })
    const second = splitIntoPassages(input, { maxCharacters: 90 })

    expect(first).toEqual(second)
    expect(first.length).toBeGreaterThan(1)
    expect(first.every((item) => item.length <= 90)).toBe(true)
    expect(() => splitIntoPassages(input, { maxCharacters: 40 })).toThrow(
      /at least 80/,
    )
  })

  it('returns a complete preprocessing trace', () => {
    const result = preprocessText('Conversion prices reset.\n\nNo other change.')
    expect(result.cleanText).toContain('\n\n')
    expect(result.normalizedText).toBe(result.tokens.join(' '))
    expect(result.passages).toHaveLength(2)
  })
})

describe('transparent weighted classifier', () => {
  it('returns raw contributions and a non-probabilistic heuristic score', () => {
    const result = classifyRiskText(
      'The convertible bond includes a conversion price reset provision.',
    )

    expect(result.predictedLabel).toBe('Dilution Risk')
    expect(result.rawScores['Dilution Risk']).toBeGreaterThan(0)
    expect(result.matchedTerms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Dilution Risk',
          term: 'price reset',
          weight: 5,
          contribution: 5,
        }),
      ]),
    )
    expect(result.signalScore).toBeGreaterThan(0)
    expect(result.signalScore).toBeLessThanOrEqual(1)
    expect(result.signalScoreNote).toBe(SIGNAL_SCORE_NOTE)
    expect(result.explanation).toContain('not a probability')
    expect(Object.keys(result.rawScores)).toHaveLength(7)
  })

  it('caps repeated phrase contributions and remains deterministic', () => {
    const text = 'Price reset, price reset, and price reset.'
    const first = classifyRiskText(text)
    const second = classifyRiskText(text)

    expect(first).toEqual(second)
    expect(first.rawScores['Dilution Risk']).toBe(10)
    expect(first.matchedTerms[0]).toMatchObject({
      occurrences: 3,
      countedOccurrences: 2,
      contribution: 10,
    })
  })

  it('uses taxonomy order as a deterministic tie-break and exposes overlap', () => {
    const result = classifyPassage(
      'The related-party arrangement remains subject to regulatory approval.',
    )

    expect(result.rawScores['Governance Risk']).toBe(4)
    expect(result.rawScores['Execution Risk']).toBe(4)
    expect(result.predictedLabel).toBe('Governance Risk')
    expect(result.explanation).toContain('Other matched categories')
  })

  it('falls back to informational with zero risk signal', () => {
    const result = classifyPassage('Interest is paid twice each calendar year.')

    expect(result.predictedLabel).toBe('Low Risk / Informational')
    expect(result.rawScores['Low Risk / Informational']).toBe(1)
    expect(result.matchedTerms).toEqual([])
    expect(result.signalScore).toBe(0)
  })

  it('keeps the documented negation limitation visible', () => {
    const result = classifyPassage(
      'No offering proceeds were paid to directors or related parties.',
    )

    expect(result.predictedLabel).toBe('Governance Risk')
    expect(result.matchedKeywords).toContain('related party')
  })
})

describe('TF-IDF cosine retrieval', () => {
  const corpus = [
    passage(
      'P-DILUTION',
      'The convertible notes include a conversion price reset that may create new shares.',
      'Dilution Risk',
      { documentId: 'DOC-B' },
    ),
    passage(
      'P-REFINANCE',
      'The company must refinance debt before the upcoming maturity.',
      'Refinancing Risk',
      { documentId: 'DOC-C' },
    ),
    passage(
      'P-PROCEEDS',
      'The use of proceeds is allocated to a new manufacturing line.',
      'Execution Risk',
      { documentId: 'DOC-D' },
    ),
  ]

  it('ranks the most lexically relevant passage and reports matched terms', () => {
    const results = searchPassages('conversion price reset', corpus, { topK: 2 })

    expect(results[0]?.passage.passageId).toBe('P-DILUTION')
    expect(results[0]?.score).toBeGreaterThan(0)
    expect(results[0]?.matchedTerms).toEqual([
      'conversion',
      'price',
      'reset',
    ])
    expect(results[0]?.rank).toBe(1)
  })

  it('normalizes lexical variants and returns no result for an OOV query', () => {
    const index = createTfidfIndex(corpus)
    expect(index.documentCount).toBe(3)
    expect(index.search('refinancing pressure')[0]?.passage.passageId).toBe(
      'P-REFINANCE',
    )
    expect(index.search('photosynthesis')).toEqual([])

    const base = index.search('conversion price')
    const withOov = index.search('conversion price holdoutonlysentinel')
    expect(withOov).toEqual(base)
  })

  it('breaks exact-score ties with stable source metadata', () => {
    const tied = [
      passage('P-02', 'conversion price', 'Dilution Risk', {
        documentId: 'DOC-B',
      }),
      passage('P-01', 'conversion price', 'Dilution Risk', {
        documentId: 'DOC-A',
      }),
    ]

    expect(
      searchPassages('conversion price', tied).map(
        (result) => result.passage.documentId,
      ),
    ).toEqual(['DOC-A', 'DOC-B'])
  })

  it('validates retrieval controls', () => {
    expect(() => searchPassages('risk', corpus, { topK: 0 })).toThrow(/topK/)
    expect(() =>
      searchPassages('risk', corpus, { minScore: 1.1 }),
    ).toThrow(/minScore/)
  })
})

describe('evaluation', () => {
  const labeled = [
    passage(
      'P-CORRECT-RISK',
      'The conversion price reset may create new shares.',
      'Dilution Risk',
    ),
    passage(
      'P-ERROR',
      'Available cash may support approximately eight months of operations.',
      'Liquidity Risk',
    ),
    passage(
      'P-CORRECT-INFO',
      'Interest is payable semiannually on ordinary business days.',
      'Low Risk / Informational',
    ),
  ]

  it('computes fixed-shape metrics and evidence examples', () => {
    const result = evaluateClassifier(labeled)

    expect(result.total).toBe(3)
    expect(result.correct).toBe(2)
    expect(result.accuracy).toBe(0.6667)
    expect(result.macroRecall).toBe(0.6667)
    expect(result.macroRecallLabelCount).toBe(3)
    expect(result.confusionMatrix).toHaveLength(7)
    expect(result.confusionMatrix.every((row) => row.length === 7)).toBe(true)
    expect(result.perLabel['Liquidity Risk']).toMatchObject({
      actualCount: 1,
      predictedCount: 0,
      correctCount: 0,
      recall: 0,
    })
    expect(result.correctExamples).toHaveLength(2)
    expect(result.errorExamples).toHaveLength(1)
    expect(result.errorExamples[0]).toMatchObject({
      passageId: 'P-ERROR',
      actualLabel: 'Liquidity Risk',
      predictedLabel: 'Low Risk / Informational',
    })
    expect(result.errorAnalysis).toContain('1 of 3 passages')
  })

  it('handles an empty evaluation without NaN metrics', () => {
    const result = evaluateClassifier([])
    expect(result.accuracy).toBe(0)
    expect(result.macroRecall).toBe(0)
    expect(result.macroRecallLabelCount).toBe(0)
    expect(result.errorAnalysis).toContain('No reference-labeled passages')
  })
})

describe('evidence-linked deterministic memo', () => {
  const memoPassages = [
    passage(
      'MEMO-P01',
      'A conversion price reset may create additional ordinary shares.',
      'Dilution Risk',
    ),
    passage(
      'MEMO-P02',
      'The lender has not committed to extend the maturity.',
      'Refinancing Risk',
    ),
    passage(
      'MEMO-P03',
      'Interest is payable each quarter.',
      'Low Risk / Informational',
    ),
  ]

  it('cites only passage IDs that exist in its source set', () => {
    const memo = generateRiskMemo(memoPassages, { title: 'Test Risk Memo' })
    const sourceIds = new Set(memoPassages.map((item) => item.passageId))

    expect(memo.title).toBe('Test Risk Memo')
    expect(memo.keyRiskSignals).toHaveLength(2)
    expect(memo.citedPassageIds.length).toBeGreaterThan(0)
    expect(
      memo.citedPassageIds.every((passageId) => sourceIds.has(passageId)),
    ).toBe(true)
    for (const passageId of memo.citedPassageIds) {
      expect(memo.markdown).toContain(`[${passageId}]`)
    }
    expect(memo.markdown).toContain('## Executive Summary')
    expect(memo.markdown).toContain('## Limitations')
    expect(memo.limitations.join(' ')).toContain('not a probability')
  })

  it('produces the same memo for the same ordered evidence', () => {
    expect(generateRiskMemo(memoPassages)).toEqual(
      generateRiskMemo(memoPassages),
    )
  })

  it('rejects duplicate citation IDs', () => {
    expect(() =>
      generateRiskMemo([
        memoPassages[0],
        { ...memoPassages[1], passageId: memoPassages[0].passageId },
      ]),
    ).toThrow(/Duplicate passageId/)
  })

  it('keeps all memo sections for an empty input', () => {
    const memo = generateRiskMemo([])
    expect(memo.citedPassageIds).toEqual([])
    expect(memo.executiveSummary).toContain('No passages')
    expect(memo.markdown).toContain('## Open Questions')
  })
})
