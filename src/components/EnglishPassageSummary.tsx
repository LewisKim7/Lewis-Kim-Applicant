interface EnglishPassageSummaryProps {
  readonly summary: string
  readonly compact?: boolean
}

export function EnglishPassageSummary({
  summary,
  compact = false,
}: EnglishPassageSummaryProps) {
  return (
    <span className={`english-passage-summary${compact ? ' is-compact' : ''}`} lang="en">
      <strong>English summary</strong>
      <span>{summary}</span>
    </span>
  )
}
