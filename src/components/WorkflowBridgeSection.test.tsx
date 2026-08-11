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
  })

  it('keeps the CB term and shows the strict-zero screen as part of the full sample', () => {
    render(<WorkflowBridgeSection />)
    fireEvent.click(screen.getByRole('tab', { name: /CB Disclosure Finder/ }))

    expect(screen.getByText('Convertible bond (CB):')).toBeTruthy()
    expect(screen.getByRole('img', {
      name: /41 of 118: matched both rates; 77 of 118: did not match both rates/,
    })).toBeTruthy()
  })
})
