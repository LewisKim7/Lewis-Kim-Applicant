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
    description:
      'Potential ownership dilution from share issuance, conversion features, warrants, or price-reset terms.',
    analystQuestion:
      'How many additional shares could be issued, and under which conversion or reset conditions?',
  },
  {
    id: 'refinancing',
    label: 'Refinancing Risk',
    description:
      'Pressure to repay, roll over, or replace debt and other near-term financing obligations.',
    analystQuestion:
      'Which obligations mature next, and what funding sources are available to repay or refinance them?',
  },
  {
    id: 'liquidity',
    label: 'Liquidity Risk',
    description:
      'Constraints on cash, working capital, covenant headroom, or the ability to continue operations.',
    analystQuestion:
      'How long can current liquidity support operations under the disclosed assumptions?',
  },
  {
    id: 'governance',
    label: 'Governance Risk',
    description:
      'Board, control, related-party, audit, voting-right, or conflict-of-interest concerns.',
    analystQuestion:
      'What controls or independent oversight mitigate the disclosed governance concern?',
  },
  {
    id: 'execution',
    label: 'Execution Risk',
    description:
      'Uncertainty around delivery, commercialization, approvals, construction, scale-up, or operating milestones.',
    analystQuestion:
      'Which dependencies and milestones determine whether management can deliver the stated plan?',
  },
  {
    id: 'market',
    label: 'Market Risk',
    description:
      'Exposure to demand, competition, pricing, rates, currencies, commodities, or wider market conditions.',
    analystQuestion:
      'Which external market variables have the greatest effect on the disclosed outlook?',
  },
  {
    id: 'informational',
    label: 'Low Risk / Informational',
    description:
      'Routine or contextual disclosure for which the baseline finds no configured risk signal.',
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
