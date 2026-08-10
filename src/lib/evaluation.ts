import type { DisclosurePassage } from '../domain/disclosure'
import { RISK_LABELS, isRiskLabel, type RiskLabel } from '../domain/risk'
import {
  classifyPassage,
  type ClassificationResult,
} from './classifier'

export type PassagePredictor = (
  passage: DisclosurePassage,
) => ClassificationResult

export interface LabelEvaluation {
  readonly label: RiskLabel
  readonly actualCount: number
  readonly predictedCount: number
  readonly correctCount: number
  /** Zero when no reference-labeled example exists for this label. */
  readonly recall: number
}

export interface EvaluationExample {
  readonly documentId: string
  readonly passageId: string
  readonly text: string
  readonly actualLabel: RiskLabel
  readonly predictedLabel: RiskLabel
  readonly signalScore: number
  readonly matchedKeywords: readonly string[]
}

export interface LabelConfusion {
  readonly actualLabel: RiskLabel
  readonly predictedLabel: RiskLabel
  readonly count: number
}

export interface EvaluationResult {
  readonly total: number
  readonly correct: number
  readonly accuracy: number
  /** Mean recall across labels represented in the reference annotations. */
  readonly macroRecall: number
  readonly macroRecallLabelCount: number
  readonly labels: typeof RISK_LABELS
  readonly perLabel: Readonly<Record<RiskLabel, LabelEvaluation>>
  /** Rows are reference labels; columns are predictions, both in `labels` order. */
  readonly confusionMatrix: readonly (readonly number[])[]
  readonly correctExamples: readonly EvaluationExample[]
  readonly errorExamples: readonly EvaluationExample[]
  readonly mostCommonConfusions: readonly LabelConfusion[]
  readonly errorAnalysis: string
  readonly metricNotes: readonly string[]
}

export interface EvaluationOptions {
  readonly maxExamplesPerGroup?: number
}

function round(value: number, digits = 4): number {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

function validateOptions(options: EvaluationOptions): Required<EvaluationOptions> {
  const maxExamplesPerGroup = options.maxExamplesPerGroup ?? 4
  if (!Number.isInteger(maxExamplesPerGroup) || maxExamplesPerGroup < 0) {
    throw new RangeError('maxExamplesPerGroup must be a non-negative integer')
  }
  return { maxExamplesPerGroup }
}

function buildPerLabel(
  matrix: readonly (readonly number[])[],
): Record<RiskLabel, LabelEvaluation> {
  const result = {} as Record<RiskLabel, LabelEvaluation>

  RISK_LABELS.forEach((label, labelIndex) => {
    const actualCount = matrix[labelIndex]?.reduce((sum, count) => sum + count, 0) ?? 0
    const predictedCount = matrix.reduce(
      (sum, row) => sum + (row[labelIndex] ?? 0),
      0,
    )
    const correctCount = matrix[labelIndex]?.[labelIndex] ?? 0
    result[label] = {
      label,
      actualCount,
      predictedCount,
      correctCount,
      recall: actualCount > 0 ? round(correctCount / actualCount) : 0,
    }
  })

  return result
}

function buildConfusions(
  matrix: readonly (readonly number[])[],
): LabelConfusion[] {
  const confusions: LabelConfusion[] = []

  RISK_LABELS.forEach((actualLabel, actualIndex) => {
    RISK_LABELS.forEach((predictedLabel, predictedIndex) => {
      if (actualIndex === predictedIndex) return
      const count = matrix[actualIndex]?.[predictedIndex] ?? 0
      if (count > 0) confusions.push({ actualLabel, predictedLabel, count })
    })
  })

  return confusions.sort(
    (a, b) =>
      b.count - a.count ||
      RISK_LABELS.indexOf(a.actualLabel) - RISK_LABELS.indexOf(b.actualLabel) ||
      RISK_LABELS.indexOf(a.predictedLabel) -
        RISK_LABELS.indexOf(b.predictedLabel),
  )
}

function buildErrorAnalysis(
  total: number,
  correct: number,
  confusions: readonly LabelConfusion[],
): string {
  if (total === 0) {
    return 'No reference-labeled passages were supplied, so no evaluation could be computed.'
  }
  if (correct === total) {
    return `The deterministic baseline classified all ${total} evaluated passages correctly. This result describes only this small labeled sample and should not be treated as evidence of generalization.`
  }

  const errorCount = total - correct
  const leading = confusions[0]
  if (!leading) {
    return `${errorCount} of ${total} passages were misclassified; inspect the error examples before changing rules.`
  }

  return `${errorCount} of ${total} passages were misclassified. The most frequent observed confusion was ${leading.actualLabel} predicted as ${leading.predictedLabel} (${leading.count} example${leading.count === 1 ? '' : 's'}), indicating where rule coverage or phrase ambiguity should be reviewed first.`
}

export function evaluateClassifier(
  passages: readonly DisclosurePassage[],
  predictor: PassagePredictor = classifyPassage,
  options: EvaluationOptions = {},
): EvaluationResult {
  const { maxExamplesPerGroup } = validateOptions(options)
  const labelIndex = new Map<RiskLabel, number>(
    RISK_LABELS.map((label, index) => [label, index]),
  )
  const matrix = RISK_LABELS.map(() => RISK_LABELS.map(() => 0))
  const correctExamples: EvaluationExample[] = []
  const errorExamples: EvaluationExample[] = []
  let correct = 0

  for (const passage of passages) {
    if (!isRiskLabel(passage.referenceLabel)) {
      throw new TypeError(
        `Passage ${passage.passageId} has an invalid referenceLabel: ${String(passage.referenceLabel)}`,
      )
    }

    const classification = predictor(passage)
    if (!isRiskLabel(classification.predictedLabel)) {
      throw new TypeError(
        `Predictor returned an invalid label for passage ${passage.passageId}`,
      )
    }

    const actualIndex = labelIndex.get(passage.referenceLabel)
    const predictedIndex = labelIndex.get(classification.predictedLabel)
    if (actualIndex === undefined || predictedIndex === undefined) {
      throw new Error('Evaluation label index is incomplete')
    }
    matrix[actualIndex][predictedIndex] += 1

    const example: EvaluationExample = {
      documentId: passage.documentId,
      passageId: passage.passageId,
      text: passage.text,
      actualLabel: passage.referenceLabel,
      predictedLabel: classification.predictedLabel,
      signalScore: classification.signalScore,
      matchedKeywords: classification.matchedKeywords,
    }

    if (passage.referenceLabel === classification.predictedLabel) {
      correct += 1
      if (correctExamples.length < maxExamplesPerGroup) {
        correctExamples.push(example)
      }
    } else if (errorExamples.length < maxExamplesPerGroup) {
      errorExamples.push(example)
    }
  }

  const perLabel = buildPerLabel(matrix)
  const representedLabels = RISK_LABELS.filter(
    (label) => perLabel[label].actualCount > 0,
  )
  const macroRecall = representedLabels.length
    ? round(
        representedLabels.reduce(
          (sum, label) => sum + perLabel[label].recall,
          0,
        ) / representedLabels.length,
      )
    : 0
  const mostCommonConfusions = buildConfusions(matrix)

  return {
    total: passages.length,
    correct,
    accuracy: passages.length ? round(correct / passages.length) : 0,
    macroRecall,
    macroRecallLabelCount: representedLabels.length,
    labels: RISK_LABELS,
    perLabel,
    confusionMatrix: matrix,
    correctExamples,
    errorExamples,
    mostCommonConfusions,
    errorAnalysis: buildErrorAnalysis(
      passages.length,
      correct,
      mostCommonConfusions,
    ),
    metricNotes: [
      'Accuracy is correct predictions divided by all reference-labeled passages.',
      'Macro recall is the unweighted mean of recall for labels represented in the reference sample; absent labels are excluded.',
      'These descriptive metrics are for the small educational corpus and do not establish out-of-sample performance.',
    ],
  }
}
