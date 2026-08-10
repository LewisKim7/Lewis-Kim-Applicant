import type { DisclosurePassage } from '../domain/disclosure'
import { tokenize } from './preprocessing'

export interface RetrievalOptions {
  readonly topK?: number
  readonly minScore?: number
}

export interface RetrievalResult {
  readonly rank: number
  readonly score: number
  readonly matchedTerms: readonly string[]
  readonly passage: DisclosurePassage
}

export interface TfidfIndex {
  readonly documentCount: number
  readonly vocabulary: readonly string[]
  search(query: string, options?: RetrievalOptions): RetrievalResult[]
}

interface WeightedDocument {
  readonly passage: DisclosurePassage
  readonly vector: ReadonlyMap<string, number>
  readonly magnitude: number
  readonly sourceIndex: number
}

interface ScoredDocument extends WeightedDocument {
  readonly rawScore: number
  readonly matchedTerms: readonly string[]
}

function termFrequency(tokens: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1)
  }
  return counts
}

function weightedTermFrequency(count: number): number {
  return count > 0 ? 1 + Math.log(count) : 0
}

/** Smoothed inverse document frequency: ln((N + 1) / (df + 1)) + 1. */
function inverseDocumentFrequency(
  documentCount: number,
  documentFrequency: number,
): number {
  return Math.log((documentCount + 1) / (documentFrequency + 1)) + 1
}

function vectorMagnitude(vector: ReadonlyMap<string, number>): number {
  let squaredSum = 0
  for (const value of vector.values()) squaredSum += value * value
  return Math.sqrt(squaredSum)
}

function round(value: number, digits = 6): number {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

function validateOptions(options: RetrievalOptions): Required<RetrievalOptions> {
  const topK = options.topK ?? 5
  const minScore = options.minScore ?? 0

  if (!Number.isInteger(topK) || topK < 1) {
    throw new RangeError('topK must be a positive integer')
  }
  if (!Number.isFinite(minScore) || minScore < 0 || minScore > 1) {
    throw new RangeError('minScore must be between 0 and 1')
  }

  return { topK, minScore }
}

/**
 * Build a deterministic in-memory TF-IDF cosine index over every supplied
 * passage. No embeddings, network calls, random state, or external API keys
 * are involved.
 */
export function createTfidfIndex(
  passages: readonly DisclosurePassage[],
): TfidfIndex {
  const corpus = [...passages]
  const tokenizedCorpus = corpus.map((passage) =>
    tokenize(passage.text, { removeStopWords: true, minTokenLength: 2 }),
  )
  const documentFrequency = new Map<string, number>()

  for (const tokens of tokenizedCorpus) {
    for (const token of new Set(tokens)) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1)
    }
  }

  const vocabulary = [...documentFrequency.keys()].sort((a, b) =>
    a.localeCompare(b, 'en'),
  )
  const idf = new Map(
    vocabulary.map((term) => [
      term,
      inverseDocumentFrequency(
        corpus.length,
        documentFrequency.get(term) ?? 0,
      ),
    ]),
  )

  const weightedDocuments: WeightedDocument[] = corpus.map(
    (passage, sourceIndex) => {
      const frequencies = termFrequency(tokenizedCorpus[sourceIndex] ?? [])
      const vector = new Map<string, number>()

      for (const [term, count] of frequencies) {
        vector.set(
          term,
          weightedTermFrequency(count) * (idf.get(term) ?? 0),
        )
      }

      return {
        passage,
        vector,
        magnitude: vectorMagnitude(vector),
        sourceIndex,
      }
    },
  )

  return {
    documentCount: corpus.length,
    vocabulary,
    search(query: string, options: RetrievalOptions = {}): RetrievalResult[] {
      const { topK, minScore } = validateOptions(options)
      const queryTokens = tokenize(query, {
        removeStopWords: true,
        minTokenLength: 2,
      })
      if (queryTokens.length === 0 || corpus.length === 0) return []

      const queryFrequencies = termFrequency(queryTokens)
      const queryVector = new Map<string, number>()
      for (const [term, count] of queryFrequencies) {
        const termIdf =
          idf.get(term) ?? inverseDocumentFrequency(corpus.length, 0)
        queryVector.set(term, weightedTermFrequency(count) * termIdf)
      }

      const queryMagnitude = vectorMagnitude(queryVector)
      if (queryMagnitude === 0) return []

      const uniqueQueryTerms = [...new Set(queryTokens)]
      const scored: ScoredDocument[] = weightedDocuments.map((document) => {
        let dotProduct = 0
        for (const [term, queryWeight] of queryVector) {
          dotProduct += queryWeight * (document.vector.get(term) ?? 0)
        }

        const denominator = queryMagnitude * document.magnitude
        const rawScore = denominator > 0 ? dotProduct / denominator : 0
        const matchedTerms = uniqueQueryTerms.filter((term) =>
          document.vector.has(term),
        )

        return { ...document, rawScore, matchedTerms }
      })

      return scored
        .filter((document) => document.rawScore > 0)
        .filter((document) => document.rawScore >= minScore)
        .sort(
          (a, b) =>
            b.rawScore - a.rawScore ||
            a.passage.documentId.localeCompare(b.passage.documentId, 'en') ||
            a.passage.passageId.localeCompare(b.passage.passageId, 'en') ||
            a.sourceIndex - b.sourceIndex,
        )
        .slice(0, topK)
        .map((document, index) => ({
          rank: index + 1,
          score: round(document.rawScore),
          matchedTerms: document.matchedTerms,
          passage: document.passage,
        }))
    },
  }
}

export function searchPassages(
  query: string,
  passages: readonly DisclosurePassage[],
  options: RetrievalOptions = {},
): RetrievalResult[] {
  return createTfidfIndex(passages).search(query, options)
}
