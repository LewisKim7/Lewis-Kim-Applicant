import { describe, expect, it } from 'vitest'
import { ALL_PASSAGES } from '../data/corpus'
import { RETRIEVAL_JUDGMENTS } from '../data/retrieval-judgments'
import { createTfidfIndex } from './retrieval'
import { evaluateRetrieval } from './retrieval-evaluation'

const INDEX = createTfidfIndex(ALL_PASSAGES)

describe('closed-corpus retrieval diagnostic', () => {
  it('freezes 12 valid Korean query judgments over known passage IDs', () => {
    expect(RETRIEVAL_JUDGMENTS).toHaveLength(12)
    expect(new Set(RETRIEVAL_JUDGMENTS.map(({ queryId }) => queryId)).size).toBe(12)
    expect(
      RETRIEVAL_JUDGMENTS.every(({ relevantPassages }) =>
        relevantPassages.every(({ grade }) => grade === 1 || grade === 2),
      ),
    ).toBe(true)
  })

  it('computes deterministic Precision, Recall, MRR, and nDCG at three', () => {
    const result = evaluateRetrieval(INDEX, RETRIEVAL_JUDGMENTS, { k: 3 })

    expect({
      queryCount: result.queryCount,
      k: result.k,
      meanPrecisionAtK: result.meanPrecisionAtK,
      meanRecallAtK: result.meanRecallAtK,
      meanReciprocalRankAtK: result.meanReciprocalRankAtK,
      meanNdcgAtK: result.meanNdcgAtK,
      queryResults: result.queries.map((query) => ({
        queryId: query.queryId,
        relevantRetrieved: query.relevantRetrieved,
        relevantCount: query.relevantCount,
        firstRelevantRank: query.firstRelevantRank,
        topPassage: query.rankedPassages[0]?.passageId ?? null,
      })),
    }).toMatchInlineSnapshot(`
      {
        "k": 3,
        "meanNdcgAtK": 0.8551,
        "meanPrecisionAtK": 0.6945,
        "meanRecallAtK": 0.7778,
        "meanReciprocalRankAtK": 0.9167,
        "queryCount": 12,
        "queryResults": [
          {
            "firstRelevantRank": 1,
            "queryId": "Q01",
            "relevantCount": 2,
            "relevantRetrieved": 2,
            "topPassage": "DOC-KR-CB-RESET-001-P01",
          },
          {
            "firstRelevantRank": 1,
            "queryId": "Q02",
            "relevantCount": 2,
            "relevantRetrieved": 1,
            "topPassage": "DOC-KR-CB-RESET-001-P02",
          },
          {
            "firstRelevantRank": 1,
            "queryId": "Q03",
            "relevantCount": 3,
            "relevantRetrieved": 3,
            "topPassage": "DOC-KR-IPO-PROCEEDS-001-P02",
          },
          {
            "firstRelevantRank": 1,
            "queryId": "Q04",
            "relevantCount": 3,
            "relevantRetrieved": 3,
            "topPassage": "DOC-KR-IPO-RISK-001-P03",
          },
          {
            "firstRelevantRank": 1,
            "queryId": "Q05",
            "relevantCount": 3,
            "relevantRetrieved": 2,
            "topPassage": "DOC-KR-IPO-RISK-001-P04",
          },
          {
            "firstRelevantRank": 1,
            "queryId": "Q06",
            "relevantCount": 3,
            "relevantRetrieved": 2,
            "topPassage": "DOC-KR-IPO-PROCEEDS-001-P04",
          },
          {
            "firstRelevantRank": 1,
            "queryId": "Q07",
            "relevantCount": 3,
            "relevantRetrieved": 3,
            "topPassage": "DOC-KR-IPO-PROSPECTUS-001-P04",
          },
          {
            "firstRelevantRank": 1,
            "queryId": "Q08",
            "relevantCount": 2,
            "relevantRetrieved": 2,
            "topPassage": "DOC-KR-CB-RESET-001-P05",
          },
          {
            "firstRelevantRank": 1,
            "queryId": "Q09",
            "relevantCount": 3,
            "relevantRetrieved": 3,
            "topPassage": "DOC-KR-IPO-RISK-001-P06",
          },
          {
            "firstRelevantRank": 1,
            "queryId": "Q10",
            "relevantCount": 2,
            "relevantRetrieved": 1,
            "topPassage": "DOC-KR-IPO-PROSPECTUS-001-P01",
          },
          {
            "firstRelevantRank": 1,
            "queryId": "Q11",
            "relevantCount": 3,
            "relevantRetrieved": 3,
            "topPassage": "DOC-KR-IPO-RISK-001-P05",
          },
          {
            "firstRelevantRank": null,
            "queryId": "Q12",
            "relevantCount": 2,
            "relevantRetrieved": 0,
            "topPassage": null,
          },
        ],
      }
    `)
  })

  it('validates k and handles an empty query set without NaN metrics', () => {
    expect(() => evaluateRetrieval(INDEX, RETRIEVAL_JUDGMENTS, { k: 0 })).toThrow(
      /positive integer/,
    )
    expect(evaluateRetrieval(INDEX, [], { k: 3 })).toMatchObject({
      queryCount: 0,
      meanPrecisionAtK: 0,
      meanRecallAtK: 0,
      meanReciprocalRankAtK: 0,
      meanNdcgAtK: 0,
    })
  })
})
