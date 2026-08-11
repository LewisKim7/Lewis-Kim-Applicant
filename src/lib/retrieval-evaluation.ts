import type { TfidfIndex } from './retrieval'

export type RetrievalRelevanceGrade = 1 | 2

export interface RetrievalRelevanceJudgment {
  readonly passageId: string
  readonly grade: RetrievalRelevanceGrade
}

export interface RetrievalQueryJudgment {
  readonly queryId: string
  readonly query: string
  readonly intent: string
  readonly relevantPassages: readonly RetrievalRelevanceJudgment[]
}

export interface RankedRetrievalJudgment {
  readonly rank: number
  readonly passageId: string
  readonly score: number
  readonly relevanceGrade: 0 | RetrievalRelevanceGrade
}

export interface RetrievalQueryEvaluation {
  readonly queryId: string
  readonly query: string
  readonly intent: string
  readonly relevantCount: number
  readonly relevantRetrieved: number
  readonly precisionAtK: number
  readonly recallAtK: number
  readonly reciprocalRankAtK: number
  readonly ndcgAtK: number
  readonly firstRelevantRank: number | null
  readonly rankedPassages: readonly RankedRetrievalJudgment[]
}

export interface RetrievalEvaluationResult {
  readonly queryCount: number
  readonly k: number
  readonly meanPrecisionAtK: number
  readonly meanRecallAtK: number
  readonly meanReciprocalRankAtK: number
  readonly meanNdcgAtK: number
  readonly queries: readonly RetrievalQueryEvaluation[]
  readonly protocolNote: string
}

function round(value: number, digits = 4): number {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

function discountedCumulativeGain(grades: readonly number[]): number {
  return grades.reduce(
    (sum, grade, index) =>
      sum + (2 ** grade - 1) / Math.log2(index + 2),
    0,
  )
}

export function evaluateRetrieval(
  index: TfidfIndex,
  judgments: readonly RetrievalQueryJudgment[],
  options: { readonly k?: number } = {},
): RetrievalEvaluationResult {
  const k = options.k ?? 3
  if (!Number.isInteger(k) || k < 1) {
    throw new RangeError('k must be a positive integer')
  }

  const queries = judgments.map((judgment): RetrievalQueryEvaluation => {
    const relevanceByPassage = new Map(
      judgment.relevantPassages.map(({ passageId, grade }) => [passageId, grade]),
    )
    const results = index.search(judgment.query, { topK: k })
    const rankedPassages = results.map((result): RankedRetrievalJudgment => ({
      rank: result.rank,
      passageId: result.passage.passageId,
      score: result.score,
      relevanceGrade: relevanceByPassage.get(result.passage.passageId) ?? 0,
    }))
    const relevantRetrieved = rankedPassages.filter(
      ({ relevanceGrade }) => relevanceGrade > 0,
    ).length
    const firstRelevantRank =
      rankedPassages.find(({ relevanceGrade }) => relevanceGrade > 0)?.rank ?? null
    const retrievedGrades = rankedPassages.map(({ relevanceGrade }) => relevanceGrade)
    const idealGrades = judgment.relevantPassages
      .map(({ grade }) => grade)
      .sort((a, b) => b - a)
      .slice(0, k)
    const idealDcg = discountedCumulativeGain(idealGrades)

    return {
      queryId: judgment.queryId,
      query: judgment.query,
      intent: judgment.intent,
      relevantCount: judgment.relevantPassages.length,
      relevantRetrieved,
      precisionAtK: round(relevantRetrieved / k),
      recallAtK: round(relevantRetrieved / judgment.relevantPassages.length),
      reciprocalRankAtK: firstRelevantRank ? round(1 / firstRelevantRank) : 0,
      ndcgAtK:
        idealDcg > 0
          ? round(discountedCumulativeGain(retrievedGrades) / idealDcg)
          : 0,
      firstRelevantRank,
      rankedPassages,
    }
  })

  const mean = (values: readonly number[]) =>
    values.length
      ? round(values.reduce((sum, value) => sum + value, 0) / values.length)
      : 0

  return {
    queryCount: queries.length,
    k,
    meanPrecisionAtK: mean(queries.map(({ precisionAtK }) => precisionAtK)),
    meanRecallAtK: mean(queries.map(({ recallAtK }) => recallAtK)),
    meanReciprocalRankAtK: mean(
      queries.map(({ reciprocalRankAtK }) => reciprocalRankAtK),
    ),
    meanNdcgAtK: mean(queries.map(({ ndcgAtK }) => ndcgAtK)),
    queries,
    protocolNote:
      'Closed-corpus diagnostic over AI-assisted Korean query and relevance judgments; not an independent retrieval benchmark.',
  }
}
