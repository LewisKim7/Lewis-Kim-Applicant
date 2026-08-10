import type { DisclosurePassage } from '../domain/disclosure'
import { RISK_LABELS, type RiskLabel } from '../domain/risk'
import { tokenize } from './preprocessing'

export interface LogisticRegressionOptions {
  readonly epochs?: number
  readonly learningRate?: number
  readonly l2Penalty?: number
}

export interface LogisticFeatureContribution {
  readonly term: string
  readonly contribution: number
}

export interface LogisticRegressionPrediction {
  readonly predictedLabel: RiskLabel
  /** Softmax output from this small fitted model; it is not calibrated confidence. */
  readonly modelScore: number
  readonly scoresByLabel: Readonly<Record<RiskLabel, number>>
  readonly leadingFeatures: readonly LogisticFeatureContribution[]
}

export interface TfidfLogisticRegressionModel {
  readonly trainingSize: number
  readonly vocabulary: readonly string[]
  readonly options: Required<LogisticRegressionOptions>
  readonly initialLoss: number
  readonly finalLoss: number
  predict(textOrPassage: string | Pick<DisclosurePassage, 'text'>): LogisticRegressionPrediction
}

export interface HeldOutPrediction {
  readonly documentId: string
  readonly passageId: string
  readonly text: string
  readonly actualLabel: RiskLabel
  readonly predictedLabel: RiskLabel
  readonly modelScore: number
  readonly leadingFeatures: readonly LogisticFeatureContribution[]
}

export interface DocumentFoldResult {
  readonly holdoutDocumentId: string
  readonly trainingCount: number
  readonly testCount: number
  readonly vocabularySize: number
  readonly correct: number
  readonly accuracy: number
  readonly initialLoss: number
  readonly finalLoss: number
}

export interface HeldOutLabelMetric {
  readonly label: RiskLabel
  readonly actualCount: number
  readonly correctCount: number
  readonly recall: number
}

export interface DocumentHeldOutEvaluation {
  readonly total: number
  readonly correct: number
  readonly accuracy: number
  readonly macroRecall: number
  readonly labels: typeof RISK_LABELS
  readonly perLabel: Readonly<Record<RiskLabel, HeldOutLabelMetric>>
  readonly confusionMatrix: readonly (readonly number[])[]
  readonly folds: readonly DocumentFoldResult[]
  readonly predictions: readonly HeldOutPrediction[]
  readonly errorExamples: readonly HeldOutPrediction[]
  readonly options: Required<LogisticRegressionOptions>
  readonly protocolNote: string
  readonly scoreNote: string
}

interface SparseVector {
  readonly indices: readonly number[]
  readonly values: readonly number[]
}

interface Vectorizer {
  readonly vocabulary: readonly string[]
  transform(text: string): SparseVector
}

export const DEFAULT_LOGISTIC_OPTIONS: Required<LogisticRegressionOptions> = {
  epochs: 400,
  learningRate: 0.4,
  l2Penalty: 0.01,
}

export const LOGISTIC_SCORE_NOTE =
  'The displayed model score is a softmax output from a tiny synthetic training fold. It is not calibrated confidence, a probability of real-world risk, or evidence of generalization.'

export const DOCUMENT_HELD_OUT_PROTOCOL_NOTE =
  'Five deterministic folds are defined by document ID. In each fold, TF-IDF vocabulary and IDF values are fitted only on the other four documents, then the logistic-regression model predicts all six passages in the unseen document.'

function round(value: number, digits = 4): number {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

function validateOptions(
  options: LogisticRegressionOptions,
): Required<LogisticRegressionOptions> {
  const merged = { ...DEFAULT_LOGISTIC_OPTIONS, ...options }

  if (!Number.isInteger(merged.epochs) || merged.epochs < 1) {
    throw new RangeError('epochs must be a positive integer')
  }
  if (!Number.isFinite(merged.learningRate) || merged.learningRate <= 0) {
    throw new RangeError('learningRate must be greater than zero')
  }
  if (!Number.isFinite(merged.l2Penalty) || merged.l2Penalty < 0) {
    throw new RangeError('l2Penalty must be non-negative')
  }

  return merged
}

function modelTokens(text: string): string[] {
  return tokenize(text, { removeStopWords: true, minTokenLength: 2 })
}

function termCounts(tokens: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1)
  return counts
}

function createVectorizer(trainingTexts: readonly string[]): Vectorizer {
  if (trainingTexts.length === 0) {
    throw new RangeError('At least one training passage is required')
  }

  const tokenized = trainingTexts.map(modelTokens)
  const documentFrequency = new Map<string, number>()
  for (const tokens of tokenized) {
    for (const token of new Set(tokens)) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1)
    }
  }

  const vocabulary = [...documentFrequency.keys()].sort((a, b) =>
    a.localeCompare(b, 'en'),
  )
  const vocabularyIndex = new Map(
    vocabulary.map((term, index) => [term, index]),
  )
  const idf = vocabulary.map((term) =>
    Math.log(
      (trainingTexts.length + 1) /
        ((documentFrequency.get(term) ?? 0) + 1),
    ) + 1,
  )

  return {
    vocabulary,
    transform(text: string): SparseVector {
      const counts = termCounts(modelTokens(text))
      const entries: Array<readonly [number, number]> = []

      for (const [term, count] of counts) {
        const index = vocabularyIndex.get(term)
        if (index === undefined) continue
        entries.push([index, (1 + Math.log(count)) * (idf[index] ?? 0)])
      }
      entries.sort((a, b) => a[0] - b[0])

      const magnitude = Math.sqrt(
        entries.reduce((sum, entry) => sum + entry[1] * entry[1], 0),
      )
      if (magnitude === 0) return { indices: [], values: [] }

      return {
        indices: entries.map((entry) => entry[0]),
        values: entries.map((entry) => entry[1] / magnitude),
      }
    },
  }
}

function logitsFor(
  vector: SparseVector,
  weights: readonly Float64Array[],
  biases: Float64Array,
): number[] {
  return RISK_LABELS.map((_, labelIndex) => {
    let logit = biases[labelIndex] ?? 0
    const labelWeights = weights[labelIndex]
    if (!labelWeights) return logit

    vector.indices.forEach((featureIndex, position) => {
      logit +=
        (labelWeights[featureIndex] ?? 0) * (vector.values[position] ?? 0)
    })
    return logit
  })
}

function softmax(logits: readonly number[]): number[] {
  const maximum = Math.max(...logits)
  const exponentials = logits.map((value) => Math.exp(value - maximum))
  const total = exponentials.reduce((sum, value) => sum + value, 0)
  return exponentials.map((value) => value / total)
}

function averageCrossEntropy(
  vectors: readonly SparseVector[],
  labelIndices: readonly number[],
  weights: readonly Float64Array[],
  biases: Float64Array,
): number {
  const loss = vectors.reduce((sum, vector, index) => {
    const probabilities = softmax(logitsFor(vector, weights, biases))
    const probability = probabilities[labelIndices[index] ?? 0] ?? 0
    return sum - Math.log(Math.max(probability, Number.EPSILON))
  }, 0)
  return vectors.length ? loss / vectors.length : 0
}

function scoreRecord(probabilities: readonly number[]): Record<RiskLabel, number> {
  return Object.fromEntries(
    RISK_LABELS.map((label, index) => [
      label,
      round(probabilities[index] ?? 0, 6),
    ]),
  ) as Record<RiskLabel, number>
}

export function trainTfidfLogisticRegression(
  passages: readonly DisclosurePassage[],
  options: LogisticRegressionOptions = {},
): TfidfLogisticRegressionModel {
  if (passages.length === 0) {
    throw new RangeError('At least one training passage is required')
  }

  const resolvedOptions = validateOptions(options)
  const vectorizer = createVectorizer(passages.map((passage) => passage.text))
  const vectors = passages.map((passage) => vectorizer.transform(passage.text))
  const labelIndices = passages.map((passage) =>
    RISK_LABELS.indexOf(passage.referenceLabel),
  )
  const weights = RISK_LABELS.map(
    () => new Float64Array(vectorizer.vocabulary.length),
  )
  const biases = new Float64Array(RISK_LABELS.length)
  const initialLoss = averageCrossEntropy(
    vectors,
    labelIndices,
    weights,
    biases,
  )

  for (let epoch = 0; epoch < resolvedOptions.epochs; epoch += 1) {
    const weightGradients = RISK_LABELS.map(
      () => new Float64Array(vectorizer.vocabulary.length),
    )
    const biasGradients = new Float64Array(RISK_LABELS.length)

    vectors.forEach((vector, sampleIndex) => {
      const probabilities = softmax(logitsFor(vector, weights, biases))
      const actualLabelIndex = labelIndices[sampleIndex]

      RISK_LABELS.forEach((_, labelIndex) => {
        const error =
          (probabilities[labelIndex] ?? 0) -
          (labelIndex === actualLabelIndex ? 1 : 0)
        biasGradients[labelIndex] += error

        const labelGradient = weightGradients[labelIndex]
        if (!labelGradient) return
        vector.indices.forEach((featureIndex, position) => {
          labelGradient[featureIndex] += error * (vector.values[position] ?? 0)
        })
      })
    })

    RISK_LABELS.forEach((_, labelIndex) => {
      biases[labelIndex] -=
        (resolvedOptions.learningRate * (biasGradients[labelIndex] ?? 0)) /
        passages.length
      const labelWeights = weights[labelIndex]
      const labelGradient = weightGradients[labelIndex]
      if (!labelWeights || !labelGradient) return

      for (let featureIndex = 0; featureIndex < labelWeights.length; featureIndex += 1) {
        const gradient =
          (labelGradient[featureIndex] ?? 0) / passages.length +
          resolvedOptions.l2Penalty * (labelWeights[featureIndex] ?? 0)
        labelWeights[featureIndex] -= resolvedOptions.learningRate * gradient
      }
    })
  }

  const finalLoss = averageCrossEntropy(
    vectors,
    labelIndices,
    weights,
    biases,
  )

  return {
    trainingSize: passages.length,
    vocabulary: vectorizer.vocabulary,
    options: resolvedOptions,
    initialLoss: round(initialLoss, 6),
    finalLoss: round(finalLoss, 6),
    predict(
      textOrPassage: string | Pick<DisclosurePassage, 'text'>,
    ): LogisticRegressionPrediction {
      const text =
        typeof textOrPassage === 'string'
          ? textOrPassage
          : textOrPassage.text
      const vector = vectorizer.transform(text)
      const probabilities = softmax(logitsFor(vector, weights, biases))
      let predictedIndex = 0
      for (let index = 1; index < probabilities.length; index += 1) {
        if ((probabilities[index] ?? 0) > (probabilities[predictedIndex] ?? 0)) {
          predictedIndex = index
        }
      }

      const predictedWeights = weights[predictedIndex]
      const leadingFeatures = vector.indices
        .map((featureIndex, position) => ({
          term: vectorizer.vocabulary[featureIndex] ?? '',
          contribution:
            (predictedWeights?.[featureIndex] ?? 0) *
            (vector.values[position] ?? 0),
        }))
        .filter((feature) => feature.term && feature.contribution > 0)
        .sort(
          (a, b) =>
            b.contribution - a.contribution ||
            a.term.localeCompare(b.term, 'en'),
        )
        .slice(0, 5)
        .map((feature) => ({
          ...feature,
          contribution: round(feature.contribution, 6),
        }))

      return {
        predictedLabel: RISK_LABELS[predictedIndex] ?? RISK_LABELS[0],
        modelScore: round(probabilities[predictedIndex] ?? 0, 6),
        scoresByLabel: Object.freeze(scoreRecord(probabilities)),
        leadingFeatures,
      }
    },
  }
}

function buildPerLabelMetrics(
  confusionMatrix: readonly (readonly number[])[],
): Record<RiskLabel, HeldOutLabelMetric> {
  return Object.fromEntries(
    RISK_LABELS.map((label, labelIndex) => {
      const actualCount =
        confusionMatrix[labelIndex]?.reduce((sum, count) => sum + count, 0) ?? 0
      const correctCount = confusionMatrix[labelIndex]?.[labelIndex] ?? 0
      return [
        label,
        {
          label,
          actualCount,
          correctCount,
          recall: actualCount ? round(correctCount / actualCount) : 0,
        },
      ]
    }),
  ) as Record<RiskLabel, HeldOutLabelMetric>
}

export function evaluateDocumentHeldOutLogisticRegression(
  passages: readonly DisclosurePassage[],
  options: LogisticRegressionOptions = {},
): DocumentHeldOutEvaluation {
  const resolvedOptions = validateOptions(options)
  const documentIds = [...new Set(passages.map((passage) => passage.documentId))].sort(
    (a, b) => a.localeCompare(b, 'en'),
  )
  if (documentIds.length < 2) {
    throw new RangeError('At least two distinct documents are required')
  }

  const predictions: HeldOutPrediction[] = []
  const folds: DocumentFoldResult[] = []

  for (const holdoutDocumentId of documentIds) {
    const trainingPassages = passages.filter(
      (passage) => passage.documentId !== holdoutDocumentId,
    )
    const testPassages = passages.filter(
      (passage) => passage.documentId === holdoutDocumentId,
    )
    const model = trainTfidfLogisticRegression(
      trainingPassages,
      resolvedOptions,
    )
    let foldCorrect = 0

    for (const passage of testPassages) {
      const prediction = model.predict(passage)
      if (prediction.predictedLabel === passage.referenceLabel) foldCorrect += 1
      predictions.push({
        documentId: passage.documentId,
        passageId: passage.passageId,
        text: passage.text,
        actualLabel: passage.referenceLabel,
        predictedLabel: prediction.predictedLabel,
        modelScore: prediction.modelScore,
        leadingFeatures: prediction.leadingFeatures,
      })
    }

    folds.push({
      holdoutDocumentId,
      trainingCount: trainingPassages.length,
      testCount: testPassages.length,
      vocabularySize: model.vocabulary.length,
      correct: foldCorrect,
      accuracy: testPassages.length ? round(foldCorrect / testPassages.length) : 0,
      initialLoss: model.initialLoss,
      finalLoss: model.finalLoss,
    })
  }

  const labelIndex = new Map<RiskLabel, number>(
    RISK_LABELS.map((label, index) => [label, index]),
  )
  const confusionMatrix = RISK_LABELS.map(() => RISK_LABELS.map(() => 0))
  for (const prediction of predictions) {
    const actualIndex = labelIndex.get(prediction.actualLabel)
    const predictedIndex = labelIndex.get(prediction.predictedLabel)
    if (actualIndex === undefined || predictedIndex === undefined) continue
    confusionMatrix[actualIndex][predictedIndex] += 1
  }

  const perLabel = buildPerLabelMetrics(confusionMatrix)
  const representedLabels = RISK_LABELS.filter(
    (label) => perLabel[label].actualCount > 0,
  )
  const correct = predictions.filter(
    (prediction) => prediction.actualLabel === prediction.predictedLabel,
  ).length

  return {
    total: predictions.length,
    correct,
    accuracy: predictions.length ? round(correct / predictions.length) : 0,
    macroRecall: representedLabels.length
      ? round(
          representedLabels.reduce(
            (sum, label) => sum + perLabel[label].recall,
            0,
          ) / representedLabels.length,
        )
      : 0,
    labels: RISK_LABELS,
    perLabel,
    confusionMatrix,
    folds,
    predictions,
    errorExamples: predictions.filter(
      (prediction) => prediction.actualLabel !== prediction.predictedLabel,
    ),
    options: resolvedOptions,
    protocolNote: DOCUMENT_HELD_OUT_PROTOCOL_NOTE,
    scoreNote: LOGISTIC_SCORE_NOTE,
  }
}
