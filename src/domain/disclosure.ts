import type { RiskLabel } from './risk'

export const DOCUMENT_TYPES = [
  'Convertible Bond Disclosure',
  'IPO Prospectus Excerpt',
  'Funding Announcement',
  'Use of Proceeds Disclosure',
  'Risk Factor Excerpt',
] as const

export type KnownDocumentType = (typeof DOCUMENT_TYPES)[number]

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
  readonly passages: readonly DisclosurePassage[]
}

export function flattenPassages(
  documents: readonly DisclosureDocument[],
): DisclosurePassage[] {
  return documents.flatMap((document) => document.passages)
}
