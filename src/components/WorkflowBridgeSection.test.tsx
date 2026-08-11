// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { WorkflowBridgeSection } from './WorkflowBridgeSection'

beforeEach(() => {
  window.history.replaceState({}, '', '/')
})
afterEach(cleanup)

describe('production tool bridge', () => {
  it('shows the frozen IPO evidence and mounts only the selected source tool', () => {
    const { container } = render(<WorkflowBridgeSection />)

    expect(screen.getByRole('tab', { name: /IPO Return Report/ }).getAttribute('aria-selected')).toBe('true')
    expect(container.textContent).toContain('52-company Korean IPO workbook')
    expect(container.textContent).toContain('COSMO ROBOTICS Co., Ltd.')

    const frame = screen.getByTitle('IPO Market Report interactive viewer')
    expect(frame.getAttribute('src')).toBe('https://ipo-market-report.vercel.app/')
    expect(container.querySelectorAll('iframe')).toHaveLength(1)
  })

  it('switches to strict CB evidence without mounting both heavy embeds', () => {
    const { container } = render(<WorkflowBridgeSection />)

    fireEvent.click(screen.getByRole('tab', { name: /CB Disclosure Finder/ }))

    expect(screen.getByRole('tab', { name: /CB Disclosure Finder/ }).getAttribute('aria-selected')).toBe('true')
    expect(container.textContent).toContain('41 filing rows from 40 issuer names')
    expect(container.textContent).toContain('HYUNDAI ENGINEERING & CONSTRUCTION CO., LTD')
    expect(container.textContent).toContain('excludes missing “−” placeholders')

    const frame = screen.getByTitle('CB Zero Finder interactive search tool')
    expect(frame.getAttribute('src')).toBe('https://cb-zero-finder.vercel.app/')
    expect(container.querySelectorAll('iframe')).toHaveLength(1)
  })

  it('uses the header hash to open the requested tool tab', () => {
    window.history.replaceState({}, '', '/#cb-finder')
    render(<WorkflowBridgeSection />)

    expect(screen.getByRole('tab', { name: /CB Disclosure Finder/ }).getAttribute('aria-selected')).toBe('true')
  })
})
