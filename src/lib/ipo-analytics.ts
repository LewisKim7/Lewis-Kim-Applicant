export interface IpoObservation {
  readonly companyName: string
  readonly market: 'KOSPI' | 'KOSDAQ'
  readonly listingDate: string
  readonly asOfDate: string
  readonly bandLow: number
  readonly bandHigh: number
  readonly offerPrice: number
  readonly offerMarketCapEok: number
  readonly firstDayClose: number
  readonly currentPrice: number
}

export interface IpoObservationAnalysis extends IpoObservation {
  readonly bandPosition: number
  readonly firstDayReturn: number
  readonly currentReturn: number
}

export interface IpoMarketSummary {
  readonly asOfDate: string | null
  readonly companyCount: number
  readonly totalOfferMarketCapEok: number
  readonly medianFirstDayReturn: number
  readonly medianCurrentReturn: number
  readonly belowOfferCount: number
  readonly belowOfferRatio: number
  readonly pricedAtOrAboveBandHighCount: number
  readonly observations: readonly IpoObservationAnalysis[]
}

function round(value: number, digits = 4): number {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

function validateFinitePositive(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${field} must be greater than zero`)
  }
}

function validateIsoDate(value: string, field: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError(`${field} must use YYYY-MM-DD format`)
  }
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new TypeError(`${field} must be a valid calendar date`)
  }
}

export function calculateOfferBandPosition(
  offerPrice: number,
  bandLow: number,
  bandHigh: number,
): number {
  validateFinitePositive(offerPrice, 'offerPrice')
  validateFinitePositive(bandLow, 'bandLow')
  validateFinitePositive(bandHigh, 'bandHigh')
  if (bandHigh <= bandLow) throw new RangeError('bandHigh must exceed bandLow')
  return round((offerPrice - bandLow) / (bandHigh - bandLow))
}

export function calculatePriceReturn(
  price: number,
  referencePrice: number,
): number {
  validateFinitePositive(price, 'price')
  validateFinitePositive(referencePrice, 'referencePrice')
  return round(price / referencePrice - 1)
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const midpoint = Math.floor(sorted.length / 2)
  if (sorted.length % 2) return sorted[midpoint] ?? 0
  return ((sorted[midpoint - 1] ?? 0) + (sorted[midpoint] ?? 0)) / 2
}

export function summarizeIpoMarket(
  observations: readonly IpoObservation[],
): IpoMarketSummary {
  const asOfDates = new Set(observations.map(({ asOfDate }) => asOfDate))
  if (asOfDates.size > 1) {
    throw new TypeError('All IPO observations must share one asOfDate')
  }

  const analyzed = observations.map((observation) => {
    validateIsoDate(observation.listingDate, 'listingDate')
    validateIsoDate(observation.asOfDate, 'asOfDate')
    if (observation.listingDate > observation.asOfDate) {
      throw new RangeError('listingDate cannot be later than asOfDate')
    }
    validateFinitePositive(observation.offerMarketCapEok, 'offerMarketCapEok')
    return {
      ...observation,
      bandPosition: calculateOfferBandPosition(
        observation.offerPrice,
        observation.bandLow,
        observation.bandHigh,
      ),
      firstDayReturn: calculatePriceReturn(
        observation.firstDayClose,
        observation.offerPrice,
      ),
      currentReturn: calculatePriceReturn(
        observation.currentPrice,
        observation.offerPrice,
      ),
    }
  })
  const belowOfferCount = analyzed.filter(
    (observation) => observation.currentReturn < 0,
  ).length

  return {
    asOfDate: observations[0]?.asOfDate ?? null,
    companyCount: analyzed.length,
    totalOfferMarketCapEok: round(
      analyzed.reduce(
        (sum, observation) => sum + observation.offerMarketCapEok,
        0,
      ),
      1,
    ),
    medianFirstDayReturn: round(
      median(analyzed.map((observation) => observation.firstDayReturn)),
    ),
    medianCurrentReturn: round(
      median(analyzed.map((observation) => observation.currentReturn)),
    ),
    belowOfferCount,
    belowOfferRatio: analyzed.length
      ? round(belowOfferCount / analyzed.length)
      : 0,
    pricedAtOrAboveBandHighCount: analyzed.filter(
      (observation) => observation.offerPrice >= observation.bandHigh,
    ).length,
    observations: analyzed,
  }
}
