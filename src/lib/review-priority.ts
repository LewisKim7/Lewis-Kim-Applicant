import type { DisclosureDocument, RiskLabel } from '../domain'
import { RISK_LABELS } from '../domain'
import { analyzePassages } from './classifier'

export const INFORMATIONAL_RISK_LABEL: RiskLabel = 'Low Risk / Informational'

export type ReviewPriority = 'High' | 'Watch' | 'Low'

export interface DocumentReviewSummary {
  readonly documentId: string
  readonly companyName: string
  readonly documentType: string
  readonly flaggedPassages: number
  readonly totalPassages: number
  readonly priority: ReviewPriority
  readonly predictedLabels: readonly RiskLabel[]
  readonly leadingLabels: readonly RiskLabel[]
}

export function reviewPriority(flaggedPassages: number, totalPassages: number): ReviewPriority {
  if (!Number.isInteger(flaggedPassages) || !Number.isInteger(totalPassages)) {
    throw new TypeError('Passage counts must be integers')
  }
  if (totalPassages <= 0 || flaggedPassages < 0 || flaggedPassages > totalPassages) {
    throw new RangeError('Passage counts must satisfy 0 <= flagged <= total')
  }

  const share = flaggedPassages / totalPassages
  if (share >= 2 / 3) return 'High'
  if (share >= 1 / 3) return 'Watch'
  return 'Low'
}

export function summarizeDocumentReview(
  document: DisclosureDocument,
): DocumentReviewSummary {
  const analyses = analyzePassages(document.passages)
  const predictedLabels = analyses.map(({ classification }) => classification.predictedLabel)
  const flaggedPassages = predictedLabels.filter(
    (label) => label !== INFORMATIONAL_RISK_LABEL,
  ).length

  const labelCounts = new Map<RiskLabel, number>()
  for (const label of predictedLabels) {
    if (label === INFORMATIONAL_RISK_LABEL) continue
    labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1)
  }

  const leadingLabels = RISK_LABELS.filter((label) => label !== INFORMATIONAL_RISK_LABEL)
    .filter((label) => labelCounts.has(label))
    .sort((left, right) => (labelCounts.get(right) ?? 0) - (labelCounts.get(left) ?? 0))
    .slice(0, 2)

  return {
    documentId: document.documentId,
    companyName: document.companyName,
    documentType: document.documentType,
    flaggedPassages,
    totalPassages: predictedLabels.length,
    priority: reviewPriority(flaggedPassages, predictedLabels.length),
    predictedLabels,
    leadingLabels,
  }
}
