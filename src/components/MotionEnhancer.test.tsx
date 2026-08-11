// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MotionEnhancer } from './MotionEnhancer'

class IntersectionObserverStub {
  disconnect = vi.fn()
  observe = vi.fn()
  unobserve = vi.fn()
}

function installMatchMedia(reducedMotion: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: reducedMotion && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
}

function renderFixture() {
  return render(
    <>
      <nav className="header-nav"><a href="#prototype">NLP Demo</a></nav>
      <section id="prototype">
        <div className="section-heading" data-testid="reveal-target">Method</div>
      </section>
      <div className="signal-console">Trace</div>
      <MotionEnhancer />
    </>,
  )
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    callback(0)
    return 1
  }))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('premium motion enhancement', () => {
  it('adds a decorative progress indicator and observes reveal targets', () => {
    installMatchMedia(false)
    const { container } = renderFixture()

    expect(container.querySelector('.page-progress')?.getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByTestId('reveal-target').classList.contains('motion-item')).toBe(true)
  })

  it('keeps content static when reduced motion is preferred', () => {
    installMatchMedia(true)
    renderFixture()

    expect(screen.getByTestId('reveal-target').classList.contains('motion-item')).toBe(false)
    expect(document.querySelector('.signal-console')?.classList.contains('is-tilting')).toBe(false)
  })
})
