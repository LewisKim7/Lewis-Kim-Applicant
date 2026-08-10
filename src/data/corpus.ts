import rawDocuments from './documents.json'
import {
  DOCUMENT_TYPES,
  RISK_LABELS,
  flattenPassages,
  isRiskLabel,
  type DisclosureDocument,
  type DisclosurePassage,
  type RiskLabel,
} from '../domain'

const EXPECTED_DOCUMENT_COUNT = 5
const EXPECTED_PASSAGE_COUNT = 30

function assertRecord(value: unknown, context: string): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`${context} must be an object`)
  }
}

function readString(record: Record<string, unknown>, key: string, context: string): string {
  const value = record[key]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${context}.${key} must be a non-empty string`)
  }
  return value
}

function parsePassage(
  value: unknown,
  parent: Omit<DisclosureDocument, 'passages'>,
  seenPassageIds: Set<string>,
): DisclosurePassage {
  const context = `${parent.documentId}.passage`
  assertRecord(value, context)

  const passageId = readString(value, 'passageId', context)
  if (seenPassageIds.has(passageId)) {
    throw new Error(`Duplicate passage ID: ${passageId}`)
  }
  seenPassageIds.add(passageId)

  const documentId = readString(value, 'documentId', context)
  const companyName = readString(value, 'companyName', context)
  const documentType = readString(value, 'documentType', context)
  const date = readString(value, 'date', context)
  const referenceLabel = value.referenceLabel

  if (
    documentId !== parent.documentId ||
    companyName !== parent.companyName ||
    documentType !== parent.documentType ||
    date !== parent.date
  ) {
    throw new Error(`${passageId} metadata must match its parent document`)
  }
  if (!isRiskLabel(referenceLabel)) {
    throw new TypeError(`${passageId}.referenceLabel is not part of the seven-label taxonomy`)
  }

  return {
    documentId,
    passageId,
    companyName,
    documentType,
    date,
    text: readString(value, 'text', context),
    referenceLabel,
    annotationRationale: readString(value, 'annotationRationale', context),
  }
}

export function parseCorpus(value: unknown): DisclosureDocument[] {
  if (!Array.isArray(value)) {
    throw new TypeError('Corpus must be an array of documents')
  }

  const seenDocumentIds = new Set<string>()
  const seenPassageIds = new Set<string>()
  const documents = value.map((candidate, index) => {
    const context = `documents[${index}]`
    assertRecord(candidate, context)

    const documentId = readString(candidate, 'documentId', context)
    if (seenDocumentIds.has(documentId)) {
      throw new Error(`Duplicate document ID: ${documentId}`)
    }
    seenDocumentIds.add(documentId)

    const parent = {
      documentId,
      companyName: readString(candidate, 'companyName', context),
      documentType: readString(candidate, 'documentType', context),
      date: readString(candidate, 'date', context),
      synthetic: candidate.synthetic === true,
    } satisfies Omit<DisclosureDocument, 'passages'>

    if (!parent.synthetic) {
      throw new Error(`${documentId} must be explicitly marked synthetic`)
    }
    if (!(DOCUMENT_TYPES as readonly string[]).includes(parent.documentType)) {
      throw new Error(`${documentId} uses an unexpected document type`)
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(parent.date)) {
      throw new Error(`${documentId}.date must use YYYY-MM-DD`)
    }
    if (!Array.isArray(candidate.passages) || candidate.passages.length === 0) {
      throw new Error(`${documentId} must contain passages`)
    }

    return {
      ...parent,
      passages: candidate.passages.map((passage) =>
        parsePassage(passage, parent, seenPassageIds),
      ),
    }
  })

  return documents
}

export const DOCUMENTS = parseCorpus(rawDocuments)
export const ALL_PASSAGES = flattenPassages(DOCUMENTS)

if (DOCUMENTS.length !== EXPECTED_DOCUMENT_COUNT || ALL_PASSAGES.length !== EXPECTED_PASSAGE_COUNT) {
  throw new Error(
    `Bundled benchmark must contain ${EXPECTED_DOCUMENT_COUNT} documents and ${EXPECTED_PASSAGE_COUNT} passages`,
  )
}

export const REFERENCE_LABEL_COUNTS: Readonly<Record<RiskLabel, number>> = Object.freeze(
  Object.fromEntries(
    RISK_LABELS.map((label) => [
      label,
      ALL_PASSAGES.filter((passage) => passage.referenceLabel === label).length,
    ]),
  ) as Record<RiskLabel, number>,
)
