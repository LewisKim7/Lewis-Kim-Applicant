import type { DisclosurePassage } from '../domain/disclosure'
import {
  RISK_LABELS,
  RISK_TAXONOMY_BY_LABEL,
  type RiskLabel,
} from '../domain/risk'
import {
  analyzePassages,
  SIGNAL_SCORE_NOTE,
  type AnalyzedPassage,
} from './classifier'
import { cleanDisclosureText } from './preprocessing'

export interface MemoEvidence {
  readonly passageId: string
  readonly documentId: string
  readonly companyName: string
  readonly documentType: string
  readonly date: string
  readonly predictedLabel: RiskLabel
  readonly signalScore: number
  readonly matchedKeywords: readonly string[]
  readonly excerpt: string
  readonly whyItMatters: string
}

export interface MemoRiskSignal {
  readonly label: RiskLabel
  readonly passageCount: number
  readonly highestSignalScore: number
  readonly matchedKeywords: readonly string[]
  readonly evidencePassageIds: readonly string[]
  readonly summary: string
}

export interface RiskMemo {
  readonly title: string
  readonly executiveSummary: string
  readonly keyRiskSignals: readonly MemoRiskSignal[]
  readonly evidence: readonly MemoEvidence[]
  readonly investmentImplications: readonly string[]
  readonly openQuestions: readonly string[]
  readonly limitations: readonly string[]
  readonly citedPassageIds: readonly string[]
  readonly markdown: string
}

export interface MemoOptions {
  readonly title?: string
  readonly maxEvidence?: number
  readonly maxEvidencePerLabel?: number
  readonly excerptCharacters?: number
}

interface RankedAnalysis {
  readonly analysis: AnalyzedPassage
  readonly sourceIndex: number
}

const INFORMATIONAL_LABEL: RiskLabel = 'Low Risk / Informational'

const IMPLICATION_BY_LABEL: Readonly<Record<RiskLabel, string>> = {
  'Dilution Risk':
    'Quantify the fully diluted share count under disclosed conversion, reset, warrant, and issuance terms before comparing per-share outcomes.',
  'Refinancing Risk':
    'Compare obligation timing with committed funding sources and test the effect of less favorable refinancing terms.',
  'Liquidity Risk':
    'Reconcile available cash, expected cash burn, covenant headroom, and near-term operating needs under a downside case.',
  'Governance Risk':
    'Review the independence, controls, approvals, and incentives surrounding the disclosed governance issue.',
  'Execution Risk':
    'Map the stated plan to measurable milestones, external dependencies, timing assumptions, and contingency actions.',
  'Market Risk':
    'Stress-test demand, pricing, rate, currency, commodity, and competitive assumptions that affect the disclosed outlook.',
  'Low Risk / Informational':
    'Treat the passage as context only until a human reviewer confirms that no material risk term or omitted dependency changes the assessment.',
}

const LIMITATIONS = [
  'The educational corpus is small and may use synthetic disclosure-style passages, so it is not representative of the full language or distribution of public filings.',
  'The baseline uses weighted phrase rules and light lexical normalization; it does not understand full context, negation, legal nuance, or causal relationships.',
  SIGNAL_SCORE_NOTE,
  'Keyword rules can produce both false positives and false negatives, especially when a risk is implied rather than stated with configured vocabulary.',
  'The memo is a deterministic summary of supplied passages, not investment advice, and does not replace source-document review or human analyst judgment.',
] as const

function validateOptions(options: MemoOptions): Required<MemoOptions> {
  const title = options.title ?? 'AI Disclosure Risk Memo'
  const maxEvidence = options.maxEvidence ?? 6
  const maxEvidencePerLabel = options.maxEvidencePerLabel ?? 2
  const excerptCharacters = options.excerptCharacters ?? 260

  if (!Number.isInteger(maxEvidence) || maxEvidence < 1) {
    throw new RangeError('maxEvidence must be a positive integer')
  }
  if (!Number.isInteger(maxEvidencePerLabel) || maxEvidencePerLabel < 1) {
    throw new RangeError('maxEvidencePerLabel must be a positive integer')
  }
  if (!Number.isInteger(excerptCharacters) || excerptCharacters < 80) {
    throw new RangeError('excerptCharacters must be an integer of at least 80')
  }

  return { title, maxEvidence, maxEvidencePerLabel, excerptCharacters }
}

function assertUniquePassageIds(analyses: readonly AnalyzedPassage[]): void {
  const seen = new Set<string>()
  for (const { passage } of analyses) {
    if (!passage.passageId.trim()) {
      throw new TypeError('Every memo source must have a non-empty passageId')
    }
    if (seen.has(passage.passageId)) {
      throw new TypeError(
        `Duplicate passageId cannot be cited unambiguously: ${passage.passageId}`,
      )
    }
    seen.add(passage.passageId)
  }
}

function formatCitation(passageId: string): string {
  return `[${passageId.replace(/\]/g, '\\]')}]`
}

function joinCitations(passageIds: readonly string[]): string {
  return passageIds.map(formatCitation).join(' ')
}

function truncateExcerpt(text: string, maxCharacters: number): string {
  const cleaned = cleanDisclosureText(text).replace(/\n+/g, ' ')
  if (cleaned.length <= maxCharacters) return cleaned

  const candidate = cleaned.slice(0, maxCharacters - 1)
  const lastSpace = candidate.lastIndexOf(' ')
  const end = lastSpace >= Math.floor(maxCharacters * 0.65) ? lastSpace : candidate.length
  return `${candidate.slice(0, end).trimEnd()}…`
}

function riskScore(analysis: AnalyzedPassage): number {
  return analysis.classification.rawScores[
    analysis.classification.predictedLabel
  ]
}

function rankAnalyses(
  analyses: readonly AnalyzedPassage[],
): RankedAnalysis[] {
  return analyses
    .map((analysis, sourceIndex) => ({ analysis, sourceIndex }))
    .sort(
      (a, b) =>
        b.analysis.classification.signalScore -
          a.analysis.classification.signalScore ||
        riskScore(b.analysis) - riskScore(a.analysis) ||
        RISK_LABELS.indexOf(a.analysis.classification.predictedLabel) -
          RISK_LABELS.indexOf(b.analysis.classification.predictedLabel) ||
        a.analysis.passage.passageId.localeCompare(
          b.analysis.passage.passageId,
          'en',
        ) ||
        a.sourceIndex - b.sourceIndex,
    )
}

function selectEvidence(
  rankedRiskAnalyses: readonly RankedAnalysis[],
  allAnalyses: readonly AnalyzedPassage[],
  maxEvidence: number,
  maxEvidencePerLabel: number,
): AnalyzedPassage[] {
  if (rankedRiskAnalyses.length === 0) {
    return allAnalyses.slice(0, Math.min(maxEvidence, 2))
  }

  const selectedIds = new Set<string>()
  const countByLabel = new Map<RiskLabel, number>()
  const selected: RankedAnalysis[] = []

  // First retain the strongest evidence for as many observed labels as the
  // evidence budget allows, then fill remaining slots by strength.
  for (const ranked of rankedRiskAnalyses) {
    const label = ranked.analysis.classification.predictedLabel
    if ((countByLabel.get(label) ?? 0) > 0) continue
    selected.push(ranked)
    selectedIds.add(ranked.analysis.passage.passageId)
    countByLabel.set(label, 1)
    if (selected.length === maxEvidence) break
  }

  if (selected.length < maxEvidence) {
    for (const ranked of rankedRiskAnalyses) {
      const { passage } = ranked.analysis
      const label = ranked.analysis.classification.predictedLabel
      if (selectedIds.has(passage.passageId)) continue
      if ((countByLabel.get(label) ?? 0) >= maxEvidencePerLabel) continue

      selected.push(ranked)
      selectedIds.add(passage.passageId)
      countByLabel.set(label, (countByLabel.get(label) ?? 0) + 1)
      if (selected.length === maxEvidence) break
    }
  }

  return selected
    .sort(
      (a, b) =>
        rankedRiskAnalyses.indexOf(a) - rankedRiskAnalyses.indexOf(b),
    )
    .map(({ analysis }) => analysis)
}

function buildEvidence(
  selected: readonly AnalyzedPassage[],
  excerptCharacters: number,
): MemoEvidence[] {
  return selected.map(({ passage, classification }) => ({
    passageId: passage.passageId,
    documentId: passage.documentId,
    companyName: passage.companyName,
    documentType: passage.documentType,
    date: passage.date,
    predictedLabel: classification.predictedLabel,
    signalScore: classification.signalScore,
    matchedKeywords: classification.matchedKeywords,
    excerpt: truncateExcerpt(passage.text, excerptCharacters),
    whyItMatters:
      RISK_TAXONOMY_BY_LABEL[classification.predictedLabel].description,
  }))
}

function buildSignals(
  allRiskAnalyses: readonly RankedAnalysis[],
  evidence: readonly MemoEvidence[],
): MemoRiskSignal[] {
  const evidenceByLabel = new Map<RiskLabel, MemoEvidence[]>()
  for (const item of evidence) {
    const group = evidenceByLabel.get(item.predictedLabel) ?? []
    group.push(item)
    evidenceByLabel.set(item.predictedLabel, group)
  }

  return RISK_LABELS.filter((label) => label !== INFORMATIONAL_LABEL)
    .filter((label) => evidenceByLabel.has(label))
    .map((label) => {
      const allForLabel = allRiskAnalyses.filter(
        ({ analysis }) => analysis.classification.predictedLabel === label,
      )
      const selectedForLabel = evidenceByLabel.get(label) ?? []
      const matchedKeywords = [
        ...new Set(
          allForLabel.flatMap(
            ({ analysis }) => analysis.classification.matchedKeywords,
          ),
        ),
      ].slice(0, 5)
      const evidencePassageIds = selectedForLabel.map(
        (item) => item.passageId,
      )
      const termSummary = matchedKeywords.length
        ? ` Matched terms included ${matchedKeywords.map((term) => `"${term}"`).join(', ')}.`
        : ''

      return {
        label,
        passageCount: allForLabel.length,
        highestSignalScore:
          allForLabel[0]?.analysis.classification.signalScore ?? 0,
        matchedKeywords,
        evidencePassageIds,
        summary: `${label} was the leading label for ${allForLabel.length} passage${allForLabel.length === 1 ? '' : 's'}.${termSummary} ${joinCitations(evidencePassageIds)}`,
      }
    })
}

function buildExecutiveSummary(
  analyses: readonly AnalyzedPassage[],
  riskAnalyses: readonly RankedAnalysis[],
  evidence: readonly MemoEvidence[],
): string {
  if (analyses.length === 0) {
    return 'No passages were supplied. The deterministic baseline produced no risk assessment.'
  }

  const companies = [...new Set(analyses.map(({ passage }) => passage.companyName))]
  const scope = companies.length === 1 ? ` for ${companies[0]}` : ''

  if (riskAnalyses.length === 0) {
    const reviewedIds = evidence.map((item) => item.passageId)
    return `Across ${analyses.length} supplied passage${analyses.length === 1 ? '' : 's'}${scope}, the deterministic baseline found no configured risk phrase. This does not mean the source is risk-free; it means only that the transparent rule vocabulary did not fire. Reviewed evidence: ${joinCitations(reviewedIds)}`
  }

  const strongest = riskAnalyses[0]?.analysis
  if (!strongest) throw new Error('Ranked risk analysis is unexpectedly empty')

  return `Across ${analyses.length} supplied passage${analyses.length === 1 ? '' : 's'}${scope}, the deterministic baseline identified ${riskAnalyses.length} passage${riskAnalyses.length === 1 ? '' : 's'} with configured risk signals. The strongest heuristic signal was ${strongest.classification.predictedLabel} (${strongest.classification.signalScore.toFixed(3)}) in ${formatCitation(strongest.passage.passageId)}. The score reflects rule strength, not probability or severity.`
}

function buildMarkdown(memo: Omit<RiskMemo, 'markdown'>): string {
  const signalLines = memo.keyRiskSignals.length
    ? memo.keyRiskSignals.map(
        (signal) => `- **${signal.label}:** ${signal.summary}`,
      )
    : ['- No configured risk signal was detected in the supplied passages.']

  const evidenceLines = memo.evidence.length
    ? memo.evidence.flatMap((item) => [
        `- **${formatCitation(item.passageId)} — ${item.companyName}, ${item.documentType} (${item.date})**`,
        `  - Baseline label: ${item.predictedLabel}; heuristic signal: ${item.signalScore.toFixed(3)}`,
        `  - Matched terms: ${item.matchedKeywords.length ? item.matchedKeywords.join(', ') : 'none'}`,
        `  - Evidence: “${item.excerpt}”`,
      ])
    : ['- No evidence passage was available.']

  const implicationLines = memo.investmentImplications.length
    ? memo.investmentImplications.map((item) => `- ${item}`)
    : ['- No risk-specific implication was generated.']
  const questionLines = memo.openQuestions.length
    ? memo.openQuestions.map((item) => `- ${item}`)
    : ['- What material context may sit outside the supplied passages?']

  return [
    `# ${memo.title}`,
    '',
    '## Executive Summary',
    '',
    memo.executiveSummary,
    '',
    '## Key Risk Signals',
    '',
    ...signalLines,
    '',
    '## Evidence',
    '',
    ...evidenceLines,
    '',
    '## Investment Implications',
    '',
    ...implicationLines,
    '',
    '## Open Questions',
    '',
    ...questionLines,
    '',
    '## Limitations',
    '',
    ...memo.limitations.map((item) => `- ${item}`),
  ].join('\n')
}

export function generateRiskMemoFromAnalyses(
  analyses: readonly AnalyzedPassage[],
  options: MemoOptions = {},
): RiskMemo {
  const validated = validateOptions(options)
  assertUniquePassageIds(analyses)

  const rankedRiskAnalyses = rankAnalyses(
    analyses.filter(
      ({ classification }) =>
        classification.predictedLabel !== INFORMATIONAL_LABEL,
    ),
  )
  const selected = selectEvidence(
    rankedRiskAnalyses,
    analyses,
    validated.maxEvidence,
    validated.maxEvidencePerLabel,
  )
  const evidence = buildEvidence(selected, validated.excerptCharacters)
  const keyRiskSignals = buildSignals(rankedRiskAnalyses, evidence)
  const implications = keyRiskSignals.map(
    (signal) =>
      `${IMPLICATION_BY_LABEL[signal.label]} ${joinCitations(signal.evidencePassageIds)}`,
  )
  const openQuestions = keyRiskSignals.map(
    (signal) =>
      `${RISK_TAXONOMY_BY_LABEL[signal.label].analystQuestion} ${joinCitations(signal.evidencePassageIds)}`,
  )

  if (keyRiskSignals.length === 0 && evidence.length > 0) {
    const evidenceIds = evidence.map((item) => item.passageId)
    implications.push(
      `${IMPLICATION_BY_LABEL[INFORMATIONAL_LABEL]} ${joinCitations(evidenceIds)}`,
    )
    openQuestions.push(
      `What material terms or context may fall outside the configured rule vocabulary? ${joinCitations(evidenceIds)}`,
    )
  }

  const withoutMarkdown: Omit<RiskMemo, 'markdown'> = {
    title: validated.title,
    executiveSummary: buildExecutiveSummary(
      analyses,
      rankedRiskAnalyses,
      evidence,
    ),
    keyRiskSignals,
    evidence,
    investmentImplications: implications,
    openQuestions,
    limitations: LIMITATIONS,
    citedPassageIds: evidence.map((item) => item.passageId),
  }

  return {
    ...withoutMarkdown,
    markdown: buildMarkdown(withoutMarkdown),
  }
}

export function generateRiskMemo(
  passages: readonly DisclosurePassage[],
  options: MemoOptions = {},
): RiskMemo {
  return generateRiskMemoFromAnalyses(analyzePassages(passages), options)
}
