// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoDashboard } from './DemoDashboard'

const scrollIntoView = vi.fn()

beforeEach(() => {
  scrollIntoView.mockClear()
  Element.prototype.scrollIntoView = scrollIntoView
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    callback(0)
    return 1
  }))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function firstSearchResult(): HTMLElement {
  const list = screen.getByText('Top evidence across corpus').closest('.retrieval-panel')
  if (!(list instanceof HTMLElement)) throw new Error('retrieval panel not found')
  const [first] = within(list).getAllByRole('button')
  if (!first) throw new Error('no retrieval result rendered')
  return first
}

describe('interactive prototype', () => {
  it('scrolls back to the highlighted passage when the same result is clicked again', () => {
    render(<DemoDashboard />)
    const result = firstSearchResult()

    fireEvent.click(result)
    expect(scrollIntoView).toHaveBeenCalledTimes(1)

    fireEvent.click(result)
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
  })
})
