import type { DisclosurePassage } from '../domain/disclosure'
import { RISK_LABELS, type RiskLabel } from '../domain/risk'
import { normalizeText, tokenize } from './preprocessing'

export interface WeightedRiskTerm {
  readonly term: string
  readonly weight: number
}

export interface RiskRuleSet {
  readonly label: RiskLabel
  readonly terms: readonly WeightedRiskTerm[]
}

export interface MatchedRiskTerm {
  readonly label: RiskLabel
  readonly term: string
  readonly normalizedTerm: string
  readonly weight: number
  readonly occurrences: number
  readonly countedOccurrences: number
  readonly contribution: number
}

export interface ClassificationResult {
  readonly predictedLabel: RiskLabel
  /** Additive weighted keyword scores before normalization. */
  readonly rawScores: Readonly<Record<RiskLabel, number>>
  readonly matchedTerms: readonly MatchedRiskTerm[]
  /** Convenience list for compact evidence-table display. */
  readonly matchedKeywords: readonly string[]
  /** A deterministic 0-1 rule-strength heuristic, never a probability. */
  readonly signalScore: number
  readonly signalScoreNote: string
  readonly explanation: string
}

export interface AnalyzedPassage {
  readonly passage: DisclosurePassage
  readonly classification: ClassificationResult
}

export const SIGNAL_SCORE_SATURATION = 12
export const SIGNAL_SCORE_NOTE =
  'The signal score is a normalized deterministic rule-strength heuristic, not a probability, calibrated confidence, or estimate of severity.'

const MAX_COUNTED_OCCURRENCES = 2
const INFORMATIONAL_LABEL: RiskLabel = 'Low Risk / Informational'
const RISK_ONLY_LABELS = RISK_LABELS.filter(
  (label): label is Exclude<RiskLabel, 'Low Risk / Informational'> =>
    label !== INFORMATIONAL_LABEL,
)

/**
 * Public and intentionally compact: each score can be audited by inspecting
 * the matched phrase, its weight, and the number of counted occurrences.
 */
export const RISK_RULES: readonly RiskRuleSet[] = [
  {
    label: 'Dilution Risk',
    terms: [
      { term: 'equity dilution', weight: 5 },
      { term: 'potential dilution', weight: 4 },
      { term: 'price reset', weight: 5 },
      { term: 'reset clause', weight: 4 },
      { term: 'reset provision', weight: 4 },
      { term: 'conversion price', weight: 3 },
      { term: 'conversion shares', weight: 3 },
      { term: 'anti-dilution', weight: 4 },
      { term: 'new shares', weight: 3 },
      { term: 'newly issued shares', weight: 4 },
      { term: 'additional ordinary shares', weight: 4 },
      { term: 'convertible securities', weight: 3 },
      { term: 'issuance increased', weight: 4 },
      { term: 'share issuance', weight: 3 },
      { term: 'convertible bond', weight: 2 },
      { term: 'fully diluted', weight: 3 },
      { term: 'warrants', weight: 3 },
      { term: 'equity offering', weight: 2 },
    ],
  },
  {
    label: 'Refinancing Risk',
    terms: [
      { term: 'refinance', weight: 5 },
      { term: 'rollover', weight: 4 },
      { term: 'debt maturity', weight: 4 },
      { term: 'maturity wall', weight: 5 },
      { term: 'upcoming maturity', weight: 4 },
      { term: 'debt repayment', weight: 3 },
      { term: 'repay existing debt', weight: 4 },
      { term: 'repay existing borrowings', weight: 4 },
      { term: 'bridge loan', weight: 3 },
      { term: 'principal due', weight: 3 },
      { term: 'debt due', weight: 3 },
      { term: 'alternative financing', weight: 4 },
      { term: 'extend the maturity', weight: 4 },
      { term: 'near-term debt', weight: 3 },
    ],
  },
  {
    label: 'Liquidity Risk',
    terms: [
      { term: 'going concern', weight: 6 },
      { term: 'working capital shortfall', weight: 5 },
      { term: 'working capital deficit', weight: 5 },
      { term: 'negative operating cash flow', weight: 5 },
      { term: 'covenant breach', weight: 5 },
      { term: 'insufficient cash', weight: 5 },
      { term: 'unable to meet obligations', weight: 5 },
      { term: 'liquidity shortfall', weight: 5 },
      { term: 'liquidity constraint', weight: 4 },
      { term: 'liquidity pressure', weight: 4 },
      { term: 'cash runway', weight: 4 },
      { term: 'cash burn', weight: 3 },
      { term: 'cash conversion cycle', weight: 4 },
      { term: 'pressure working capital', weight: 4 },
    ],
  },
  {
    label: 'Governance Risk',
    terms: [
      { term: 'material weakness', weight: 5 },
      { term: 'qualified opinion', weight: 5 },
      { term: 'related party', weight: 4 },
      { term: 'conflict of interest', weight: 4 },
      { term: 'board independence', weight: 4 },
      { term: 'audit qualification', weight: 4 },
      { term: 'internal control weakness', weight: 5 },
      { term: 'governance concern', weight: 4 },
      { term: 'controlling shareholder', weight: 3 },
      { term: 'voting rights', weight: 3 },
      { term: 'voting power', weight: 4 },
      { term: 'votes per share', weight: 4 },
      { term: 'dual-class shares', weight: 3 },
    ],
  },
  {
    label: 'Execution Risk',
    terms: [
      { term: 'execution risk', weight: 5 },
      { term: 'construction delay', weight: 5 },
      { term: 'launch delay', weight: 4 },
      { term: 'milestone delay', weight: 4 },
      { term: 'regulatory approval', weight: 4 },
      { term: 'commercialization', weight: 4 },
      { term: 'commercial production', weight: 3 },
      { term: 'production ramp', weight: 4 },
      { term: 'customer concentration', weight: 4 },
      { term: 'supply chain disruption', weight: 4 },
      { term: 'scale-up', weight: 3 },
      { term: 'trial results', weight: 3 },
      { term: 'manufacturing capacity', weight: 3 },
      { term: 'permit approval', weight: 3 },
      { term: 'implementation delay', weight: 4 },
      { term: 'environmental permitting', weight: 4 },
      { term: 'commissioning tests', weight: 3 },
      { term: 'integration failure', weight: 4 },
      { term: 'launch-provider delay', weight: 5 },
    ],
  },
  {
    label: 'Market Risk',
    terms: [
      { term: 'market downturn', weight: 5 },
      { term: 'market volatility', weight: 4 },
      { term: 'demand uncertainty', weight: 4 },
      { term: 'competitive pressure', weight: 4 },
      { term: 'pricing pressure', weight: 4 },
      { term: 'competition', weight: 3 },
      { term: 'interest rate', weight: 3 },
      { term: 'foreign exchange', weight: 3 },
      { term: 'currency fluctuation', weight: 3 },
      { term: 'commodity price', weight: 3 },
      { term: 'feedstock prices', weight: 4 },
      { term: 'macroeconomic', weight: 3 },
      { term: 'customer demand', weight: 3 },
    ],
  },
  {
    label: INFORMATIONAL_LABEL,
    terms: [
      { term: 'no material change', weight: 4 },
      { term: 'ordinary course', weight: 3 },
      { term: 'completed as planned', weight: 3 },
      { term: 'informational', weight: 3 },
      { term: 'fully funded', weight: 2 },
      { term: 'unchanged', weight: 2 },
      { term: 'routine', weight: 2 },
      { term: 'for reference', weight: 2 },
    ],
  },
] as const

function emptyScoreRecord(): Record<RiskLabel, number> {
  return {
    'Dilution Risk': 0,
    'Refinancing Risk': 0,
    'Liquidity Risk': 0,
    'Governance Risk': 0,
    'Execution Risk': 0,
    'Market Risk': 0,
    'Low Risk / Informational': 0,
  }
}

function countSequence(tokens: readonly string[], phrase: readonly string[]): number {
  if (phrase.length === 0 || phrase.length > tokens.length) return 0

  let occurrences = 0
  for (let start = 0; start <= tokens.length - phrase.length; start += 1) {
    let matches = true
    for (let offset = 0; offset < phrase.length; offset += 1) {
      if (tokens[start + offset] !== phrase[offset]) {
        matches = false
        break
      }
    }
    if (matches) occurrences += 1
  }
  return occurrences
}

function labelOrder(label: RiskLabel): number {
  return RISK_LABELS.indexOf(label)
}

function round(value: number, digits = 3): number {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

function createExplanation(
  predictedLabel: RiskLabel,
  rawScores: Readonly<Record<RiskLabel, number>>,
  matchedTerms: readonly MatchedRiskTerm[],
  signalScore: number,
): string {
  const predictedMatches = matchedTerms.filter(
    (match) => match.label === predictedLabel,
  )

  if (predictedLabel === INFORMATIONAL_LABEL) {
    if (predictedMatches.length === 0) {
      return `No configured risk phrase was matched, so the deterministic baseline returned ${INFORMATIONAL_LABEL}. ${SIGNAL_SCORE_NOTE}`
    }

    const terms = predictedMatches
      .slice(0, 3)
      .map((match) => `"${match.term}" (+${match.contribution})`)
      .join(', ')
    return `Informational phrases ${terms} were matched and no configured risk phrase was present. ${SIGNAL_SCORE_NOTE}`
  }

  const leadingTerms = predictedMatches
    .slice(0, 3)
    .map((match) => `"${match.term}" (+${match.contribution})`)
    .join(', ')
  const competing = RISK_ONLY_LABELS.filter(
    (label) => label !== predictedLabel && rawScores[label] > 0,
  )
    .sort((a, b) => rawScores[b] - rawScores[a] || labelOrder(a) - labelOrder(b))
    .slice(0, 2)
    .map((label) => `${label} (${rawScores[label]})`)

  const competitionNote = competing.length
    ? ` Other matched categories: ${competing.join(', ')}.`
    : ''

  return `${predictedLabel} had the highest weighted rule score (${rawScores[predictedLabel]}) from ${leadingTerms}.${competitionNote} The signal score is ${signalScore.toFixed(3)} after dividing the winning rule score by ${SIGNAL_SCORE_SATURATION} and capping at 1. ${SIGNAL_SCORE_NOTE}`
}

export function classifyRiskText(text: string): ClassificationResult {
  const tokens = tokenize(text)
  const rawScores = emptyScoreRecord()
  const matchedTerms: MatchedRiskTerm[] = []

  for (const ruleSet of RISK_RULES) {
    for (const weightedTerm of ruleSet.terms) {
      const normalizedTerm = normalizeText(weightedTerm.term)
      const termTokens = normalizedTerm.split(' ').filter(Boolean)
      const occurrences = countSequence(tokens, termTokens)
      if (occurrences === 0) continue

      const countedOccurrences = Math.min(
        occurrences,
        MAX_COUNTED_OCCURRENCES,
      )
      const contribution = weightedTerm.weight * countedOccurrences
      rawScores[ruleSet.label] += contribution
      matchedTerms.push({
        label: ruleSet.label,
        term: weightedTerm.term,
        normalizedTerm,
        weight: weightedTerm.weight,
        occurrences,
        countedOccurrences,
        contribution,
      })
    }
  }

  matchedTerms.sort(
    (a, b) =>
      b.contribution - a.contribution ||
      labelOrder(a.label) - labelOrder(b.label) ||
      a.term.localeCompare(b.term, 'en'),
  )

  const predictedLabel = RISK_ONLY_LABELS.reduce<RiskLabel>(
    (leader, label) =>
      rawScores[label] > rawScores[leader] ? label : leader,
    RISK_ONLY_LABELS[0],
  )
  const hasRiskSignal = rawScores[predictedLabel] > 0
  const finalLabel = hasRiskSignal ? predictedLabel : INFORMATIONAL_LABEL

  if (!hasRiskSignal && rawScores[INFORMATIONAL_LABEL] === 0) {
    // An explicit baseline makes raw output easier to inspect than an all-zero
    // vector while never competing with a matched risk category.
    rawScores[INFORMATIONAL_LABEL] = 1
  }

  const signalScore = hasRiskSignal
    ? round(Math.min(rawScores[finalLabel] / SIGNAL_SCORE_SATURATION, 1))
    : 0
  const matchedKeywords = [...new Set(matchedTerms.map((match) => match.term))]

  return {
    predictedLabel: finalLabel,
    rawScores: Object.freeze({ ...rawScores }),
    matchedTerms,
    matchedKeywords,
    signalScore,
    signalScoreNote: SIGNAL_SCORE_NOTE,
    explanation: createExplanation(
      finalLabel,
      rawScores,
      matchedTerms,
      signalScore,
    ),
  }
}

export function classifyPassage(
  passageOrText: string | Pick<DisclosurePassage, 'text'>,
): ClassificationResult {
  return classifyRiskText(
    typeof passageOrText === 'string' ? passageOrText : passageOrText.text,
  )
}

export function analyzePassages(
  passages: readonly DisclosurePassage[],
): AnalyzedPassage[] {
  return passages.map((passage) => ({
    passage,
    classification: classifyPassage(passage),
  }))
}
