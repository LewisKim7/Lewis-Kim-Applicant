import type { RetrievalQueryJudgment } from '../lib/retrieval-evaluation'
import { ALL_PASSAGES } from './corpus'

const PASSAGE_IDS = new Set(ALL_PASSAGES.map(({ passageId }) => passageId))

const JUDGMENTS = [
  {
    queryId: 'Q01',
    query: '전환가액 리픽싱 희석',
    intent: 'Find passages connecting conversion-price resets with dilution.',
    relevantPassages: [
      { passageId: 'DOC-KR-CB-RESET-001-P01', grade: 2 },
      { passageId: 'DOC-KR-CB-ISSUE-001-P01', grade: 1 },
    ],
  },
  {
    queryId: 'Q02',
    query: '조기상환청구권 현금 상환',
    intent: 'Find liquidity pressure created by a bondholder put option.',
    relevantPassages: [
      { passageId: 'DOC-KR-CB-RESET-001-P02', grade: 2 },
      { passageId: 'DOC-KR-CB-ISSUE-001-P02', grade: 1 },
    ],
  },
  {
    queryId: 'Q03',
    query: '공모자금 차입금 상환 차환',
    intent: 'Find offering proceeds allocated to debt repayment or refinancing.',
    relevantPassages: [
      { passageId: 'DOC-KR-IPO-PROSPECTUS-001-P02', grade: 2 },
      { passageId: 'DOC-KR-IPO-PROCEEDS-001-P02', grade: 2 },
      { passageId: 'DOC-KR-CB-ISSUE-001-P02', grade: 1 },
    ],
  },
  {
    queryId: 'Q04',
    query: '운전자금 부족 현금 회수',
    intent: 'Find working-capital pressure caused by collection timing.',
    relevantPassages: [
      { passageId: 'DOC-KR-IPO-PROCEEDS-001-P03', grade: 2 },
      { passageId: 'DOC-KR-IPO-RISK-001-P03', grade: 2 },
      { passageId: 'DOC-KR-CB-ISSUE-001-P03', grade: 1 },
    ],
  },
  {
    queryId: 'Q05',
    query: '특수관계인 이해상충 이사회',
    intent: 'Find governance passages involving related parties or board conflicts.',
    relevantPassages: [
      { passageId: 'DOC-KR-IPO-RISK-001-P04', grade: 2 },
      { passageId: 'DOC-KR-IPO-PROSPECTUS-001-P03', grade: 2 },
      { passageId: 'DOC-KR-CB-ISSUE-001-P04', grade: 2 },
    ],
  },
  {
    queryId: 'Q06',
    query: '생산설비 증설 인허가 시험가동',
    intent: 'Find execution dependencies in a capacity-expansion plan.',
    relevantPassages: [
      { passageId: 'DOC-KR-IPO-PROCEEDS-001-P04', grade: 2 },
      { passageId: 'DOC-KR-CB-ISSUE-001-P05', grade: 1 },
      { passageId: 'DOC-KR-CB-RESET-001-P04', grade: 1 },
    ],
  },
  {
    queryId: 'Q07',
    query: '고객사 승인 양산 지연',
    intent: 'Find commercialization delays tied to customer approval or scale-up.',
    relevantPassages: [
      { passageId: 'DOC-KR-IPO-PROSPECTUS-001-P04', grade: 2 },
      { passageId: 'DOC-KR-CB-ISSUE-001-P05', grade: 2 },
      { passageId: 'DOC-KR-CB-RESET-001-P04', grade: 1 },
    ],
  },
  {
    queryId: 'Q08',
    query: '오버행 매도 물량 주가 변동성',
    intent: 'Find market pressure from post-conversion or post-listing supply.',
    relevantPassages: [
      { passageId: 'DOC-KR-CB-RESET-001-P05', grade: 2 },
      { passageId: 'DOC-KR-IPO-RISK-001-P01', grade: 1 },
    ],
  },
  {
    queryId: 'Q09',
    query: '가격 경쟁 고객 수요 둔화',
    intent: 'Find demand risk caused by price competition or weaker customer demand.',
    relevantPassages: [
      { passageId: 'DOC-KR-IPO-PROSPECTUS-001-P05', grade: 2 },
      { passageId: 'DOC-KR-IPO-RISK-001-P06', grade: 2 },
      { passageId: 'DOC-KR-IPO-PROCEEDS-001-P05', grade: 1 },
    ],
  },
  {
    queryId: 'Q10',
    query: '구주매출 신주모집 지분 희석',
    intent: 'Find IPO share composition and dilution from new issuance.',
    relevantPassages: [
      { passageId: 'DOC-KR-IPO-PROSPECTUS-001-P01', grade: 2 },
      { passageId: 'DOC-KR-IPO-PROCEEDS-001-P01', grade: 1 },
    ],
  },
  {
    queryId: 'Q11',
    query: '발사 일정 지연 시스템 통합',
    intent: 'Find execution risk from launch or systems-integration delays.',
    relevantPassages: [
      { passageId: 'DOC-KR-IPO-RISK-001-P05', grade: 2 },
      { passageId: 'DOC-KR-IPO-RISK-001-P02', grade: 1 },
      { passageId: 'DOC-KR-CB-ISSUE-001-P05', grade: 1 },
    ],
  },
  {
    queryId: 'Q12',
    query: '남은 청약대금 관리 보고',
    intent: 'Test a paraphrased request for custody and reporting of unused proceeds.',
    relevantPassages: [
      { passageId: 'DOC-KR-IPO-PROCEEDS-001-P06', grade: 2 },
      { passageId: 'DOC-KR-IPO-PROSPECTUS-001-P06', grade: 1 },
    ],
  },
] as const satisfies readonly RetrievalQueryJudgment[]

function validateJudgments(
  judgments: readonly RetrievalQueryJudgment[],
): readonly RetrievalQueryJudgment[] {
  const queryIds = new Set<string>()

  for (const judgment of judgments) {
    if (queryIds.has(judgment.queryId)) {
      throw new Error(`Duplicate retrieval query ID: ${judgment.queryId}`)
    }
    queryIds.add(judgment.queryId)

    if (!judgment.query.trim() || !judgment.intent.trim()) {
      throw new Error(`${judgment.queryId} must declare a query and intent`)
    }
    if (judgment.relevantPassages.length === 0) {
      throw new Error(`${judgment.queryId} must declare relevant passages`)
    }

    const relevantIds = new Set<string>()
    for (const relevant of judgment.relevantPassages) {
      if (!PASSAGE_IDS.has(relevant.passageId)) {
        throw new Error(
          `${judgment.queryId} references an unknown passage: ${relevant.passageId}`,
        )
      }
      if (relevantIds.has(relevant.passageId)) {
        throw new Error(
          `${judgment.queryId} repeats passage: ${relevant.passageId}`,
        )
      }
      relevantIds.add(relevant.passageId)
      if (relevant.grade !== 1 && relevant.grade !== 2) {
        throw new Error(`${judgment.queryId} uses an unsupported relevance grade`)
      }
    }
  }

  return judgments
}

/** AI-assisted, closed-corpus relevance judgments for diagnostic use only. */
export const RETRIEVAL_JUDGMENTS = validateJudgments(JUDGMENTS)
