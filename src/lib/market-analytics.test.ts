import { describe, expect, it } from 'vitest'
import {
  SYNTHETIC_CB_ROWS,
  SYNTHETIC_IPO_OBSERVATIONS,
} from '../data/market-samples'
import { DOCUMENTS } from '../data/corpus'
import {
  isZeroRate,
  parseFinancialNumber,
  screenConvertibleBonds,
} from './cb-analytics'
import {
  calculateOfferBandPosition,
  calculatePriceReturn,
  summarizeIpoMarket,
} from './ipo-analytics'

describe('Korean CB screening calculations', () => {
  it('normalizes financial values and treats only explicit numeric zero as zero', () => {
    expect(parseFinancialNumber('1,234.5억원')).toBe(1234.5)
    expect(parseFinancialNumber('-')).toBeNaN()
    expect(isZeroRate('0.0')).toBe(true)
    expect(isZeroRate(0)).toBe(true)
    expect(isZeroRate('-')).toBe(false)
    expect(isZeroRate('')).toBe(false)
  })

  it('reproduces rate, amount, query, sorting, and aggregation behavior', () => {
    const result = screenConvertibleBonds(SYNTHETIC_CB_ROWS, {
      rateFilter: 'surface0',
      minAmountEok: 200,
    })

    expect(result.totalRows).toBe(4)
    expect(result.matchedRows).toBe(2)
    expect(result.matchedAmountEok).toBe(520)
    expect(result.rows.map((row) => row.receiptNo)).toEqual([
      'SYNTH-CB-004',
      'SYNTH-CB-001',
    ])
    expect(
      screenConvertibleBonds(SYNTHETIC_CB_ROWS, { query: '900102' }).rows[0]
        ?.corpName,
    ).toBe('세림뉴로칩')
  })

  it('rejects invalid filter inputs', () => {
    expect(() =>
      screenConvertibleBonds(SYNTHETIC_CB_ROWS, { minAmountEok: -1 }),
    ).toThrow(/non-negative/)

    const firstCb = SYNTHETIC_CB_ROWS[0]
    if (!firstCb) throw new Error('Expected a bundled CB observation')
    const invalidAmount = [{ ...firstCb, amountEok: '-' }]
    expect(screenConvertibleBonds(invalidAmount).matchedRows).toBe(0)
    expect(screenConvertibleBonds(invalidAmount).matchedAmountEok).toBe(0)
  })
})

describe('Korean IPO market calculations', () => {
  it('calculates offer-band position and price returns at their boundaries', () => {
    expect(calculateOfferBandPosition(15_000, 10_000, 20_000)).toBe(0.5)
    expect(calculateOfferBandPosition(20_000, 10_000, 20_000)).toBe(1)
    expect(calculatePriceReturn(12_000, 10_000)).toBe(0.2)
    expect(() => calculateOfferBandPosition(10, 10, 10)).toThrow(/bandHigh/)
  })

  it('summarizes the bundled fictional IPO snapshot deterministically', () => {
    const result = summarizeIpoMarket(SYNTHETIC_IPO_OBSERVATIONS)

    expect(result.companyCount).toBe(6)
    expect(result.asOfDate).toBe('2026-07-31')
    expect(result.totalOfferMarketCapEok).toBe(42_000)
    expect(result.medianFirstDayReturn).toBe(0.125)
    expect(result.medianCurrentReturn).toBe(0.0147)
    expect(result.belowOfferCount).toBe(3)
    expect(result.belowOfferRatio).toBe(0.5)
    expect(result.pricedAtOrAboveBandHighCount).toBe(3)
  })

  it('returns defined zero metrics for an empty snapshot', () => {
    expect(summarizeIpoMarket([])).toMatchObject({
      asOfDate: null,
      companyCount: 0,
      totalOfferMarketCapEok: 0,
      medianFirstDayReturn: 0,
      medianCurrentReturn: 0,
      belowOfferCount: 0,
      belowOfferRatio: 0,
    })
  })

  it('requires one valid, non-forward-looking snapshot date', () => {
    const first = SYNTHETIC_IPO_OBSERVATIONS[0]
    if (!first) throw new Error('Expected a bundled IPO observation')

    expect(() =>
      summarizeIpoMarket([{ ...first, asOfDate: '2026-02-30' }]),
    ).toThrow(/valid calendar date/)
    expect(() =>
      summarizeIpoMarket([{ ...first, asOfDate: '2026-01-01' }]),
    ).toThrow(/later than asOfDate/)
    expect(() =>
      summarizeIpoMarket([
        first,
        { ...first, companyName: '다른가상기업', asOfDate: '2026-07-30' },
      ]),
    ).toThrow(/share one asOfDate/)
  })

  it('keeps fictional IPO dates on business days and after linked source dates', () => {
    for (const observation of SYNTHETIC_IPO_OBSERVATIONS) {
      const listingDay = new Date(`${observation.listingDate}T00:00:00Z`).getUTCDay()
      const snapshotDay = new Date(`${observation.asOfDate}T00:00:00Z`).getUTCDay()
      expect([0, 6]).not.toContain(listingDay)
      expect([0, 6]).not.toContain(snapshotDay)
    }

    const ipoDocuments = DOCUMENTS.filter(({ workflow }) => workflow === 'Korean IPO Review')
    for (const document of ipoDocuments) {
      const observation = SYNTHETIC_IPO_OBSERVATIONS.find(
        ({ companyName }) => companyName === document.companyName,
      )
      expect(observation, `Missing IPO observation for ${document.companyName}`).toBeDefined()
      expect(document.date <= (observation?.listingDate ?? '')).toBe(true)
    }
  })
})
