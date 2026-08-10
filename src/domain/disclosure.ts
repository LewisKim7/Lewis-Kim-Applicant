import type { RiskLabel } from './risk'

export const DOCUMENT_TYPES = [
  'DART-style CB Issuance Decision',
  'DART-style CB Terms Amendment',
  'KOSDAQ IPO Prospectus Excerpt',
  'KOSPI IPO Use-of-Proceeds Excerpt',
  'KOSDAQ IPO Risk-Factor Excerpt',
] as const

export type KnownDocumentType = (typeof DOCUMENT_TYPES)[number]

export const KOREAN_MARKETS = ['KOSPI', 'KOSDAQ'] as const
export type KoreanMarket = (typeof KOREAN_MARKETS)[number]

export const ANALYSIS_WORKFLOWS = [
  'OpenDART CB Review',
  'Korean IPO Review',
] as const
export type AnalysisWorkflow = (typeof ANALYSIS_WORKFLOWS)[number]

export interface DocumentKeyFact {
  readonly label: string
  readonly value: string
}

/**
 * A normalized, independently citable unit of disclosure text.
 *
 * `documentType` remains a string so the educational corpus can add a new
 * disclosure type without changing runtime code. `DOCUMENT_TYPES` lists the
 * five types used by the bundled sample corpus.
 */
export interface DisclosurePassage {
  readonly documentId: string
  readonly passageId: string
  readonly companyName: string
  readonly documentType: string
  readonly date: string
  readonly text: string
  readonly referenceLabel: RiskLabel
  readonly annotationRationale: string
}

export interface DisclosureDocument {
  readonly documentId: string
  readonly companyName: string
  readonly documentType: string
  readonly date: string
  readonly synthetic: boolean
  readonly language: 'ko'
  readonly market: KoreanMarket
  readonly workflow: AnalysisWorkflow
  readonly keyFacts: readonly DocumentKeyFact[]
  readonly passages: readonly DisclosurePassage[]
}

export function flattenPassages(
  documents: readonly DisclosureDocument[],
): DisclosurePassage[] {
  return documents.flatMap((document) => document.passages)
}
