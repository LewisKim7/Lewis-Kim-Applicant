// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { WorkflowBridgeSection } from './WorkflowBridgeSection'

afterEach(cleanup)

describe('plain-language market visualizations', () => {
  it('explains the IPO term and visualizes the below-offer share', () => {
    render(<WorkflowBridgeSection />)

    expect(screen.getByText('IPO (initial public offering):')).toBeTruthy()
    expect(screen.getByRole('img', {
      name: /36 of 52: below IPO price; 16 of 52: at or above IPO price/,
    })).toBeTruthy()
    expect(screen.getByTitle('IPO Market Report interactive viewer').getAttribute('src'))
      .toBe('https://ipo-market-report.vercel.app/?embed=portfolio')
    expect(screen.getByRole('link', { name: /Open full tool/ }).getAttribute('href'))
      .toBe('https://ipo-market-report.vercel.app/')
  })

  it('keeps the CB term and shows the strict-zero screen as part of the full sample', () => {
    render(<WorkflowBridgeSection />)
    fireEvent.click(screen.getByRole('tab', { name: /CB Disclosure Finder/ }))

    expect(screen.getByText('Convertible bond (CB):')).toBeTruthy()
    expect(screen.getByRole('img', {
      name: /41 of 118: matched both rates; 77 of 118: did not match both rates/,
    })).toBeTruthy()
  })

  it('supports arrow-key tab navigation with a roving tab stop', () => {
    render(<WorkflowBridgeSection />)
    const ipoTab = screen.getByRole('tab', { name: /IPO Return Report/ })
    const cbTab = screen.getByRole('tab', { name: /CB Disclosure Finder/ })

    expect(ipoTab.getAttribute('tabindex')).toBe('0')
    expect(cbTab.getAttribute('tabindex')).toBe('-1')
    expect(cbTab.hasAttribute('aria-controls')).toBe(false)

    ipoTab.focus()
    fireEvent.keyDown(ipoTab, { key: 'ArrowRight' })

    expect(cbTab.getAttribute('aria-selected')).toBe('true')
    expect(cbTab.getAttribute('tabindex')).toBe('0')
    expect(document.activeElement).toBe(cbTab)
    expect(document.getElementById(cbTab.getAttribute('aria-controls') ?? '')).toBe(
      screen.getByRole('tabpanel'),
    )

    fireEvent.keyDown(cbTab, { key: 'Home' })
    expect(ipoTab.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(ipoTab)
  })

  it('renders the same prose counts as the frozen snapshot', () => {
    const { container } = render(<WorkflowBridgeSection />)
    const text = () => container.textContent?.replace(/\s+/g, ' ') ?? ''

    expect(text()).toContain('This report follows 52 Korean IPOs from their offer price to later market prices.')
    expect(text()).toContain('52-company frozen snapshot')
    expect(text()).toContain('but 36 of 52 were later below their IPO price. Price data shows')
    expect(text()).toContain('52 companies · price changes after listing')

    fireEvent.click(screen.getByRole('tab', { name: /CB Disclosure Finder/ }))
    expect(text()).toContain('118 filing rows in the frozen 90-day snapshot')
    expect(text()).toContain('takeaway: 41 filing rows from 40 company names stated both rates as 0%.')
  })
})
