// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { RiskOverview } from './RiskOverview'

afterEach(cleanup)

describe('reviewer-facing risk matrix', () => {
  it('keeps formal risk terms and pairs them with concise plain-English notes', () => {
    render(<RiskOverview />)

    expect(screen.getByRole('heading', {
      name: 'Which risks appear in each document?',
    })).toBeTruthy()
    expect(screen.getByText('Dilution')).toBeTruthy()
    expect(screen.getByText('Existing ownership may shrink')).toBeTruthy()
    expect(screen.getByText('Refinancing')).toBeTruthy()
    expect(screen.getByText('Debt may be hard to repay')).toBeTruthy()
    expect(screen.getByText('Liquidity')).toBeTruthy()
    expect(screen.getByText('Cash may run short')).toBeTruthy()
  })

  it('renders one coded six-passage matrix for each fictional document', () => {
    render(<RiskOverview />)

    const matrices = screen.getAllByRole('img')
    expect(matrices).toHaveLength(5)
    expect(matrices.every((matrix) => matrix.children.length === 6)).toBe(true)
    expect(screen.getAllByText(/passages contain a match/)).toHaveLength(5)
  })

  it('states the interpretation boundary beside the visualization', () => {
    render(<RiskOverview />)

    expect(screen.getByText(/do not mean the company is bad/)).toBeTruthy()
    expect(screen.getByText(/represent a probability/)).toBeTruthy()
    expect(screen.getByText(/All five companies and passages/)).toBeTruthy()
  })
})
