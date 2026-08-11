import { describe, expect, it } from 'vitest'
import { DOCUMENTS } from './corpus'
import { FROZEN_MARKET_SNAPSHOT } from './market-snapshot'

describe('frozen production-tool evidence', () => {
  it('freezes the declared IPO report metadata and selected extremes', () => {
    const { ipo } = FROZEN_MARKET_SNAPSHOT

    expect(FROZEN_MARKET_SNAPSHOT.frozenAt).toBe('2026-08-11')
    expect(ipo.sourceUrl).toBe('https://ipo-market-report.vercel.app/')
    expect(ipo.reportSha256).toMatch(/^[a-f0-9]{64}$/)
    expect(ipo.dataDate).toBe('2026-08-07')
    expect(ipo.companyCount).toBe(52)
    expect(ipo.totalOfferMarketCapTrillionKrw).toBe(19.5)
    expect(ipo.averageFirstDayReturnPct).toBe(111.4)
    expect(ipo.averageCurrentReturnPct).toBe(-5.1)
    expect(ipo.belowOfferCount + ipo.aboveOfferCount).toBe(ipo.companyCount)
    expect(ipo.featuredReturns).toHaveLength(6)
    expect(Math.max(...ipo.featuredReturns.map((row) => row.currentReturnPct))).toBe(208)
    expect(Math.min(...ipo.featuredReturns.map((row) => row.currentReturnPct))).toBe(-75)
  })

  it('freezes a strict numeric 0% / 0% CB screen at receipt-number grain', () => {
    const { cb } = FROZEN_MARKET_SNAPSHOT

    expect(cb.sourceEndpoint).toBe('https://cb-zero-finder.vercel.app/api/cb-latest')
    expect(cb.sourceResponseSha256).toMatch(/^[a-f0-9]{64}$/)
    expect(cb.filingRowCount).toBe(118)
    expect(cb.bothZeroRowCount).toBe(41)
    expect(cb.bothZeroIssuerCount).toBe(40)
    expect(cb.bothZeroAmountEok).toBe(17_898.6)
    expect(cb.featuredRows).toHaveLength(5)
    expect(new Set(cb.featuredRows.map(({ receiptNo }) => receiptNo)).size).toBe(5)
    expect(cb.featuredRows.every(({ couponRate, maturityYield }) => (
      couponRate === 0 && maturityYield === 0
    ))).toBe(true)
    expect(cb.featuredRows.map(({ amountEok }) => amountEok)).toEqual([
      5_000,
      1_700,
      1_000,
      1_000,
      750,
    ])
  })

  it('keeps real market issuers separate from the synthetic NLP corpus', () => {
    const realNames = new Set([
      ...FROZEN_MARKET_SNAPSHOT.ipo.featuredReturns.map(({ companyNameKo }) => companyNameKo),
      ...FROZEN_MARKET_SNAPSHOT.cb.featuredRows.map(({ companyNameKo }) => companyNameKo),
    ])

    for (const document of DOCUMENTS) {
      expect(realNames.has(document.companyName)).toBe(false)
      expect(document.synthetic).toBe(true)
    }
  })
})
