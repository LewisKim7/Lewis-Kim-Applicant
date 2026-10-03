// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Hero } from './Hero'

afterEach(cleanup)

describe('hero classification trace', () => {
  it('marks matched Korean phrases with lang="ko" so screen readers switch voice', () => {
    const { container } = render(<Hero />)
    const matchLines = container.querySelectorAll('.signal-console__match > span')

    expect(matchLines.length).toBeGreaterThan(0)
    const koreanLines = [...matchLines].filter((line) => /Korean phrases:/.test(line.textContent ?? ''))
    expect(koreanLines).toHaveLength(2)
    for (const line of koreanLines) {
      const korean = line.querySelector('[lang="ko"]')?.textContent ?? ''
      expect(korean).toMatch(/[가-힣]/)
      expect(line.textContent?.replace(korean, '')).not.toMatch(/[가-힣]/)
    }
  })
})
