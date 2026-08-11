import { describe, expect, it } from 'vitest'
import { RISK_RULES } from './classifier'
import { matchedTermEnglishGloss } from './term-glossary'

describe('matched-term English glossary', () => {
  it('covers every Korean phrase in the deterministic rule baseline', () => {
    const missing = RISK_RULES.flatMap(({ terms }) => terms.map(({ term }) => term))
      .filter((term) => /[가-힣]/u.test(term))
      .filter((term) => matchedTermEnglishGloss(term) === null)

    expect(missing).toEqual([])
  })

  it('returns a concise finance-context gloss for a visible CB phrase', () => {
    expect(matchedTermEnglishGloss('전환가액 조정')).toBe('conversion price adjustment')
  })
})
