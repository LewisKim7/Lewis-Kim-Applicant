import { describe, expect, it } from 'vitest'
import { DOCUMENTS } from '../data/corpus'
import { reviewPriority, summarizeDocumentReview } from './review-priority'

describe('plain-language review priority', () => {
  it('maps six-passage flag counts to the disclosed thresholds', () => {
    expect(reviewPriority(0, 6)).toBe('Low')
    expect(reviewPriority(1, 6)).toBe('Low')
    expect(reviewPriority(2, 6)).toBe('Watch')
    expect(reviewPriority(3, 6)).toBe('Watch')
    expect(reviewPriority(4, 6)).toBe('High')
    expect(reviewPriority(6, 6)).toBe('High')
  })

  it('derives the overview from the current transparent-rule output', () => {
    const summaries = DOCUMENTS.map(summarizeDocumentReview)

    expect(summaries).toHaveLength(5)
    expect(summaries.map(({ flaggedPassages }) => flaggedPassages)).toEqual([3, 5, 6, 5, 6])
    expect(summaries.every(({ totalPassages }) => totalPassages === 6)).toBe(true)
    expect(summaries.map(({ priority }) => priority)).toEqual([
      'Watch',
      'High',
      'High',
      'High',
      'High',
    ])
  })

  it('rejects impossible counts rather than showing a misleading chart', () => {
    expect(() => reviewPriority(7, 6)).toThrow(/0 <= flagged <= total/)
    expect(() => reviewPriority(-1, 6)).toThrow(/0 <= flagged <= total/)
    expect(() => reviewPriority(0, 0)).toThrow(/0 <= flagged <= total/)
  })
})
