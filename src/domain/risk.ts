export const RISK_LABELS = [
  'Dilution Risk',
  'Refinancing Risk',
  'Liquidity Risk',
  'Governance Risk',
  'Execution Risk',
  'Market Risk',
  'Low Risk / Informational',
] as const

export type RiskLabel = (typeof RISK_LABELS)[number]

export const RISK_LABEL_IDS = [
  'dilution',
  'refinancing',
  'liquidity',
  'governance',
  'execution',
  'market',
  'informational',
] as const

export type RiskLabelId = (typeof RISK_LABEL_IDS)[number]

export interface RiskTaxonomyEntry {
  readonly id: RiskLabelId
  readonly label: RiskLabel
  readonly readerLabel: string
  readonly plainQuestion: string
  readonly description: string
  readonly analystQuestion: string
}

/**
 * A fixed seven-label taxonomy. Its order is also the canonical row/column
 * order used by evaluation confusion matrices.
 */
export const RISK_TAXONOMY: readonly RiskTaxonomyEntry[] = [
  {
    id: 'dilution',
    label: 'Dilution Risk',
    readerLabel: 'Existing ownership may shrink',
    plainQuestion: 'Could new shares reduce each existing shareholder’s percentage ownership?',
    description:
      'Potential ownership dilution from CB conversion, re-fixing terms, warrants, or primary-share issuance.',
    analystQuestion:
      'At the re-fixing floor, how many additional shares could be issued and how would ownership per share change?',
  },
  {
    id: 'refinancing',
    label: 'Refinancing Risk',
    readerLabel: 'Debt may be hard to repay',
    plainQuestion: 'Can the company repay upcoming debt or replace it with new financing?',
    description:
      'Pressure created by CB put windows, maturity schedules, debt repayment, or replacement financing.',
    analystQuestion:
      'When can holders exercise early-redemption rights, and which committed sources can fund that obligation?',
  },
  {
    id: 'liquidity',
    label: 'Liquidity Risk',
    readerLabel: 'Cash may run short',
    plainQuestion: 'Does the company have enough cash to operate and meet near-term payments?',
    description:
      'Constraints on cash runway, working capital, IPO proceeds allocation, or continued operations.',
    analystQuestion:
      'After restricted uses of proceeds and near-term payments, how long can available liquidity support operations?',
  },
  {
    id: 'governance',
    label: 'Governance Risk',
    readerLabel: 'Conflicts may affect fairness',
    plainQuestion: 'Could insiders benefit while other shareholders have less protection?',
    description:
      'Concerns around related-party CB allottees, call-option beneficiaries, board oversight, or control.',
    analystQuestion:
      'Who ultimately benefits from the allotment or call option, and what independent review protects other shareholders?',
  },
  {
    id: 'execution',
    label: 'Execution Risk',
    readerLabel: 'The plan may be delayed',
    plainQuestion: 'What approvals, construction, customers, or other milestones must go right?',
    description:
      'Uncertainty around IPO use-of-proceeds plans, permits, construction, scale-up, approvals, or delivery milestones.',
    analystQuestion:
      'Which dependencies and milestones determine whether management can deliver the stated plan?',
  },
  {
    id: 'market',
    label: 'Market Risk',
    readerLabel: 'Demand or prices may weaken',
    plainQuestion: 'Could weaker demand, competition, or market prices hurt the outcome?',
    description:
      'Exposure to IPO demand, offer pricing, CB overhang, stock-price volatility, competition, or wider market conditions.',
    analystQuestion:
      'Which demand, pricing, volatility, or post-listing supply assumptions have the greatest effect on the outcome?',
  },
  {
    id: 'informational',
    label: 'Low Risk / Informational',
    readerLabel: 'No main warning phrase found',
    plainQuestion: 'Is this routine context, or does it leave an important question unanswered?',
    description:
      'Routine dates, terms, or context for which the baseline finds no configured primary risk signal.',
    analystQuestion:
      'Is this passage merely contextual, or does it omit detail needed to assess a risk?',
  },
] as const

export const RISK_TAXONOMY_BY_LABEL: Readonly<
  Record<RiskLabel, RiskTaxonomyEntry>
> = Object.freeze(
  Object.fromEntries(
    RISK_TAXONOMY.map((entry) => [entry.label, entry]),
  ) as Record<RiskLabel, RiskTaxonomyEntry>,
)

export function isRiskLabel(value: unknown): value is RiskLabel {
  return typeof value === 'string' && RISK_LABELS.some((label) => label === value)
}
