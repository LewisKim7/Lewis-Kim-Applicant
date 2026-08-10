export interface TokenizeOptions {
  readonly removeStopWords?: boolean
  readonly minTokenLength?: number
}

export interface PassageSplitOptions {
  readonly maxCharacters?: number
}

export interface PreprocessedText {
  readonly cleanText: string
  readonly normalizedText: string
  readonly tokens: readonly string[]
  readonly passages: readonly string[]
}

const ENGLISH_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'been',
  'but',
  'by',
  'for',
  'from',
  'had',
  'has',
  'have',
  'in',
  'into',
  'is',
  'it',
  'its',
  'may',
  'of',
  'on',
  'or',
  'our',
  'that',
  'the',
  'their',
  'this',
  'to',
  'was',
  'were',
  'will',
  'with',
])

/**
 * Small, explicit lexical map used by both the rules and retrieval engine.
 * This is intentionally not a general-purpose stemmer: aggressive stemming
 * would make the baseline less inspectable and can merge financially distinct
 * terms.
 */
const LEXICAL_NORMALIZATION: Readonly<Record<string, string>> = {
  borrowings: 'borrowing',
  breaches: 'breach',
  breached: 'breach',
  changes: 'change',
  changed: 'change',
  conflicts: 'conflict',
  competing: 'competition',
  converted: 'convert',
  converting: 'convert',
  converts: 'convert',
  conversions: 'conversion',
  covenants: 'covenant',
  customers: 'customer',
  delayed: 'delay',
  delays: 'delay',
  disclosures: 'disclosure',
  diluted: 'dilution',
  dilutive: 'dilution',
  documents: 'document',
  issuances: 'issuance',
  issued: 'issuance',
  issues: 'issuance',
  issuing: 'issuance',
  liabilities: 'liability',
  markets: 'market',
  maturities: 'maturity',
  milestones: 'milestone',
  notes: 'note',
  parties: 'party',
  prices: 'price',
  refinanced: 'refinance',
  refinances: 'refinance',
  refinancing: 'refinance',
  repaid: 'repay',
  repaying: 'repay',
  repayment: 'repay',
  repayments: 'repay',
  resets: 'reset',
  resetting: 'reset',
  rights: 'right',
  risks: 'risk',
  shares: 'share',
  shortfalls: 'shortfall',
  tests: 'test',
  votes: 'vote',
  weaknesses: 'weakness',
  warrants: 'warrant',
}

/** Normalize display text without losing paragraph boundaries. */
export function cleanDisclosureText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/\u00ad/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t\f\v ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function normalizeToken(token: string): string {
  return LEXICAL_NORMALIZATION[token] ?? token
}

/**
 * Tokenize Unicode text, lowercase English, and apply only the declared light
 * lexical normalization above. Hyphenated terms become separate phrase tokens
 * so `price-reset` and `price reset` behave consistently.
 */
export function tokenize(
  text: string,
  options: TokenizeOptions = {},
): string[] {
  const { removeStopWords = false, minTokenLength = 1 } = options
  const prepared = cleanDisclosureText(text)
    .toLocaleLowerCase('en-US')
    .replace(/([\p{L}\p{N}])['\u2019]s\b/gu, '$1')
    .replace(/[-/]/g, ' ')

  const rawTokens = prepared.match(/[\p{L}\p{N}]+/gu) ?? []

  return rawTokens
    .map(normalizeToken)
    .filter((token) => token.length >= minTokenLength)
    .filter((token) => !removeStopWords || !ENGLISH_STOP_WORDS.has(token))
}

export function normalizeText(text: string): string {
  return tokenize(text).join(' ')
}

function splitLongUnit(unit: string, maxCharacters: number): string[] {
  if (unit.length <= maxCharacters) return [unit]

  const words = unit.split(/\s+/)
  const parts: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length <= maxCharacters || current.length === 0) {
      current = next
      continue
    }

    parts.push(current)
    current = word
  }

  if (current) parts.push(current)
  return parts
}

/**
 * Deterministically create readable passages from paragraphs and sentences.
 * It does not invent metadata; callers attach the returned strings to source
 * document and passage IDs.
 */
export function splitIntoPassages(
  text: string,
  options: PassageSplitOptions = {},
): string[] {
  const { maxCharacters = 600 } = options
  if (!Number.isInteger(maxCharacters) || maxCharacters < 80) {
    throw new RangeError('maxCharacters must be an integer of at least 80')
  }

  const cleaned = cleanDisclosureText(text)
  if (!cleaned) return []

  const passages: string[] = []
  for (const paragraph of cleaned.split(/\n{2,}/)) {
    const units = (
      paragraph.match(/[^.!?]+(?:[.!?]+|$)/g)?.map((part) => part.trim()) ?? []
    )
      .filter(Boolean)
      .flatMap((unit) => splitLongUnit(unit, maxCharacters))
    let current = ''

    for (const unit of units) {
      const next = current ? `${current} ${unit}` : unit
      if (next.length <= maxCharacters || current.length === 0) {
        current = next
        continue
      }

      passages.push(current)
      current = unit
    }

    if (current) passages.push(current)
  }
  return passages
}

export function preprocessText(
  text: string,
  passageOptions: PassageSplitOptions = {},
): PreprocessedText {
  const cleanText = cleanDisclosureText(text)
  const tokens = tokenize(cleanText)

  return {
    cleanText,
    normalizedText: tokens.join(' '),
    tokens,
    passages: splitIntoPassages(cleanText, passageOptions),
  }
}
