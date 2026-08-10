export interface ConvertibleBondRow {
  readonly receiptDate: string
  readonly corpName: string
  readonly stockCode: string
  readonly amountEok: number | string
  readonly surfaceRate: number | string
  readonly maturityRate: number | string
  readonly maturityDate: string
  readonly convertPrice: number | string
  readonly receiptNo: string
}

export type CbRateFilter = 'all' | 'surface0' | 'both0'

export interface CbScreenOptions {
  readonly rateFilter?: CbRateFilter
  readonly query?: string
  readonly minAmountEok?: number
}

export interface CbScreenSummary {
  readonly totalRows: number
  readonly matchedRows: number
  readonly matchedAmountEok: number
  readonly rows: readonly ConvertibleBondRow[]
}

export function parseFinancialNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : Number.NaN
  const raw = String(value ?? '').trim()
  if (!/[0-9]/.test(raw)) return Number.NaN
  const parsed = Number(raw.replace(/[^0-9.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

export function isZeroRate(value: number | string | null | undefined): boolean {
  const raw = String(value ?? '').trim()
  return /[0-9]/.test(raw) && Math.abs(parseFinancialNumber(value)) < 0.000001
}

export function screenConvertibleBonds(
  rows: readonly ConvertibleBondRow[],
  options: CbScreenOptions = {},
): CbScreenSummary {
  const rateFilter = options.rateFilter ?? 'all'
  const query = (options.query ?? '').trim().toLocaleLowerCase('ko-KR')
  const minAmountEok = options.minAmountEok ?? 0

  if (!['all', 'surface0', 'both0'].includes(rateFilter)) {
    throw new TypeError('rateFilter is invalid')
  }
  if (!Number.isFinite(minAmountEok) || minAmountEok < 0) {
    throw new RangeError('minAmountEok must be non-negative')
  }

  const filtered = rows
    .filter((row) => {
      const matchesRate =
        rateFilter === 'all' ||
        (rateFilter === 'surface0' && isZeroRate(row.surfaceRate)) ||
        (rateFilter === 'both0' &&
          isZeroRate(row.surfaceRate) &&
          isZeroRate(row.maturityRate))
      const searchable = `${row.corpName} ${row.stockCode}`.toLocaleLowerCase('ko-KR')
      return (
        matchesRate &&
        searchable.includes(query) &&
        parseFinancialNumber(row.amountEok) >= minAmountEok
      )
    })
    .sort(
      (a, b) =>
        b.receiptDate.localeCompare(a.receiptDate, 'en') ||
        b.receiptNo.localeCompare(a.receiptNo, 'en'),
    )

  return {
    totalRows: rows.length,
    matchedRows: filtered.length,
    matchedAmountEok: Math.round(
      filtered.reduce(
        (sum, row) => sum + parseFinancialNumber(row.amountEok),
        0,
      ) * 10,
    ) / 10,
    rows: filtered,
  }
}
