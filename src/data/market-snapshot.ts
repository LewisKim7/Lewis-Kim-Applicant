export interface FrozenCbRow {
  readonly receiptDate: string
  readonly companyNameEn: string
  readonly companyNameKo: string
  readonly stockCode: string
  readonly amountEok: number
  readonly couponRate: number
  readonly maturityYield: number
  readonly maturityDate: string
  readonly conversionPriceKrw: number
  readonly receiptNo: string
}

export interface FrozenIpoReturn {
  readonly companyNameEn: string
  readonly companyNameKo: string
  readonly currentReturnPct: number
}

/**
 * Read-only portfolio evidence captured from the applicant's two deployed tools.
 * This module is intentionally static so the admissions artifact remains reproducible.
 * The linked source tools can update independently after the dates below.
 */
export const FROZEN_MARKET_SNAPSHOT = {
  frozenAt: '2026-08-11',
  ipo: {
    sourceName: 'IPO Market Report',
    sourceUrl: 'https://ipo-market-report.vercel.app/',
    reportUrl: 'https://ipo-market-report.vercel.app/report.pdf',
    reportSha256: '898f8f0be5c05bcece43495e8b1939abc9750d57963570d01cd7a236dcb36884',
    dataDate: '2026-08-07',
    generatedAt: '2026-08-08',
    periodLabel: 'Aug 2025–Aug 2026',
    companyCount: 52,
    totalOfferMarketCapTrillionKrw: 19.5,
    averageFirstDayReturnPct: 111.4,
    averageCurrentReturnPct: -5.1,
    belowOfferCount: 36,
    aboveOfferCount: 16,
    featuredReturns: [
      {
        companyNameEn: 'COSMO ROBOTICS Co., Ltd.',
        companyNameKo: '코스모로보틱스',
        currentReturnPct: 208,
      },
      {
        companyNameEn: 'Rznomics Inc.',
        companyNameKo: '알지노믹스',
        currentReturnPct: 188,
      },
      {
        companyNameEn: 'Nota Inc.',
        companyNameKo: '노타',
        currentReturnPct: 136,
      },
      {
        companyNameEn: 'TERAVIEW HOLDINGS PLC',
        companyNameKo: '테라뷰',
        currentReturnPct: -70,
      },
      {
        companyNameEn: 'HANPASS CO., Ltd.',
        companyNameKo: '한패스',
        currentReturnPct: -72,
      },
      {
        companyNameEn: 'StradVision, Inc.',
        companyNameKo: '스트라드비젼',
        currentReturnPct: -75,
      },
    ] satisfies readonly FrozenIpoReturn[],
  },
  cb: {
    sourceName: 'CB Zero Finder',
    sourceUrl: 'https://cb-zero-finder.vercel.app/',
    sourceEndpoint: 'https://cb-zero-finder.vercel.app/api/cb-latest',
    sourceResponseSha256: '58f526f1397c6649eafabe6f8488cf48d5765c0d5f914ee8c84912245e1bb494',
    capturedAt: '2026-08-11T00:56:32.283Z',
    capturedAtLabel: '11 Aug 2026 · 09:56 KST',
    periodStart: '2026-05-14',
    periodEnd: '2026-08-11',
    filingRowCount: 118,
    bothZeroRowCount: 41,
    bothZeroIssuerCount: 40,
    bothZeroAmountEok: 17_898.6,
    featuredRows: [
      {
        receiptDate: '2026-06-09',
        companyNameEn: 'HYUNDAI ENGINEERING & CONSTRUCTION CO., LTD',
        companyNameKo: '현대건설',
        stockCode: '000720',
        amountEok: 5_000,
        couponRate: 0,
        maturityYield: 0,
        maturityDate: '2031-07-07',
        conversionPriceKrw: 150_607,
        receiptNo: '20260609000517',
      },
      {
        receiptDate: '2026-07-22',
        companyNameEn: 'LigaChem Biosciences Inc.',
        companyNameKo: '리가켐바이오',
        stockCode: '141080',
        amountEok: 1_700,
        couponRate: 0,
        maturityYield: 0,
        maturityDate: '2036-07-24',
        conversionPriceKrw: 121_400,
        receiptNo: '20260722000069',
      },
      {
        receiptDate: '2026-08-06',
        companyNameEn: 'SUNGHO ELECTRONICS CORP.',
        companyNameKo: '성호전자',
        stockCode: '043260',
        amountEok: 1_000,
        couponRate: 0,
        maturityYield: 0,
        maturityDate: '2029-08-14',
        conversionPriceKrw: 19_114,
        receiptNo: '20260806000512',
      },
      {
        receiptDate: '2026-07-10',
        companyNameEn: 'TSE CO., Ltd',
        companyNameKo: '티에스이',
        stockCode: '131290',
        amountEok: 1_000,
        couponRate: 0,
        maturityYield: 0,
        maturityDate: '2031-07-22',
        conversionPriceKrw: 238_664,
        receiptNo: '20260710000416',
      },
      {
        receiptDate: '2026-05-14',
        companyNameEn: 'WON TECH CO., Ltd.',
        companyNameKo: '원텍',
        stockCode: '336570',
        amountEok: 750,
        couponRate: 0,
        maturityYield: 0,
        maturityDate: '2031-05-22',
        conversionPriceKrw: 8_270,
        receiptNo: '20260514000557',
      },
    ] satisfies readonly FrozenCbRow[],
  },
} as const
