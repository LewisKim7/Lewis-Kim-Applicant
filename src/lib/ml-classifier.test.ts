import { describe, expect, it } from 'vitest'
import { ALL_PASSAGES } from '../data/corpus'
import type { DisclosurePassage } from '../domain/disclosure'
import { RISK_LABELS, type RiskLabel } from '../domain/risk'
import {
  evaluateDocumentHeldOutLogisticRegression,
  trainTfidfLogisticRegression,
} from './ml-classifier'

function passage(
  passageId: string,
  text: string,
  referenceLabel: RiskLabel,
  documentId = 'DOC-TRAIN',
): DisclosurePassage {
  return {
    documentId,
    passageId,
    companyName: 'Synthetic Test Company',
    documentType: 'Risk Factor Excerpt',
    date: '2026-01-01',
    text,
    referenceLabel,
    annotationRationale: 'Inline unit-test annotation.',
  }
}

describe('TF-IDF multinomial logistic regression', () => {
  const trainingPassages = [
    passage('P-DIL-01', 'conversion price reset creates new shares', 'Dilution Risk'),
    passage('P-DIL-02', 'new share issuance dilutes ownership', 'Dilution Risk'),
    passage('P-LIQ-01', 'cash runway and working capital shortfall', 'Liquidity Risk'),
    passage('P-LIQ-02', 'insufficient cash creates liquidity pressure', 'Liquidity Risk'),
    passage('P-MKT-01', 'competition and pricing pressure reduce demand', 'Market Risk'),
    passage('P-MKT-02', 'market downturn reduces customer demand', 'Market Risk'),
  ]

  it('fits deterministically, decreases training loss, and returns finite scores', () => {
    const first = trainTfidfLogisticRegression(trainingPassages)
    const second = trainTfidfLogisticRegression(trainingPassages)
    const firstPrediction = first.predict('conversion reset may create shares')
    const secondPrediction = second.predict('conversion reset may create shares')

    expect(first.finalLoss).toBeLessThan(first.initialLoss)
    expect(firstPrediction).toEqual(secondPrediction)
    expect(firstPrediction.predictedLabel).toBe('Dilution Risk')
    expect(
      Object.values(firstPrediction.scoresByLabel).reduce(
        (sum, value) => sum + value,
        0,
      ),
    ).toBeCloseTo(1, 5)
    expect(firstPrediction.leadingFeatures.length).toBeGreaterThan(0)
    expect(
      Object.values(firstPrediction.scoresByLabel).every(Number.isFinite),
    ).toBe(true)
  })

  it('fits vocabulary on training text only and handles an all-OOV passage', () => {
    const model = trainTfidfLogisticRegression(trainingPassages)
    const unseenSentinel = 'holdoutonlysentinel'
    const prediction = model.predict(unseenSentinel)

    expect(model.vocabulary).not.toContain(unseenSentinel)
    expect(RISK_LABELS).toContain(prediction.predictedLabel)
    expect(Number.isFinite(prediction.modelScore)).toBe(true)
    expect(prediction.leadingFeatures).toEqual([])
  })

  it('validates training inputs and hyperparameters', () => {
    expect(() => trainTfidfLogisticRegression([])).toThrow(/training passage/)
    expect(() =>
      trainTfidfLogisticRegression(trainingPassages, { epochs: 0 }),
    ).toThrow(/epochs/)
    expect(() =>
      trainTfidfLogisticRegression(trainingPassages, { learningRate: 0 }),
    ).toThrow(/learningRate/)
    expect(() =>
      trainTfidfLogisticRegression(trainingPassages, { l2Penalty: -1 }),
    ).toThrow(/l2Penalty/)
  })
})

describe('leave-one-document-out evaluation', () => {
  it('uses five disjoint document folds and reproduces the frozen result', () => {
    const result = evaluateDocumentHeldOutLogisticRegression(ALL_PASSAGES)

    expect(result.folds).toHaveLength(5)
    expect(result.folds.map((fold) => fold.holdoutDocumentId).sort()).toEqual(
      [...new Set(ALL_PASSAGES.map((item) => item.documentId))].sort(),
    )
    expect(
      result.folds.every(
        (fold) => fold.trainingCount === 24 && fold.testCount === 6,
      ),
    ).toBe(true)
    expect(result.predictions).toHaveLength(30)
    expect(new Set(result.predictions.map((item) => item.passageId)).size).toBe(30)
    expect(result.correct).toBe(26)
    expect(result.accuracy).toBe(0.8667)
    expect(result.macroRecall).toBe(0.8571)
    expect(result.confusionMatrix).toHaveLength(7)
    expect(result.confusionMatrix.every((row) => row.length === 7)).toBe(true)
  })

  it('rejects a corpus that cannot define a document holdout', () => {
    expect(() =>
      evaluateDocumentHeldOutLogisticRegression([
        passage('P-ONLY', 'conversion price reset', 'Dilution Risk'),
      ]),
    ).toThrow(/two distinct documents/)
  })
})
