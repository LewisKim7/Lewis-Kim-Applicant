// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ProfileSection } from './ProfileSection'

afterEach(cleanup)

describe('applicant profile section', () => {
  it('presents the applicant background in English with requested organization links', () => {
    const { container } = render(<ProfileSection />)

    expect(screen.getByRole('heading', {
      name: 'Korean capital-markets experience, translated into a testable NLP project.',
    })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Hanyang University' }).getAttribute('href'),
    ).toBe('https://www.topuniversities.com/universities/hanyang-university?hl=ko-KR')
    expect(
      screen.getByRole('link', { name: 'Coolidge Corner Investment (CCVC)' }).getAttribute('href'),
    ).toBe('https://ccvc.co.kr/')
    expect(
      screen.getByRole('link', { name: 'Hanwha Asset Management' }).getAttribute('href'),
    ).toBe('https://www.hanwhafund.co.kr/en')
    expect(container.textContent).toContain(
      'an influential early-stage venture capital firm in Korea',
    )
    expect(container.textContent).toContain(
      'ranked No. 5 among Korea’s large business groups by assets in 2026',
    )
    expect(container.querySelector('[lang="ko"]')).toBeNull()
  })

  it('links the profile and dated DART manager-listing evidence', () => {
    render(<ProfileSection />)

    expect(screen.getByRole('link', { name: /View Lewis Kim profile/ }).getAttribute('href')).toBe(
      'https://personal-sns-beta.vercel.app/',
    )
    expect(
      screen
        .getByRole('link', { name: /Fund manager · Hanwha IPO Plus fund/ })
        .getAttribute('href'),
    ).toContain('rcpNo=20250826000004')
    expect(
      screen.getByAltText('Illustrated profile of Yoochan Kim (Lewis Kim)').getAttribute('src'),
    ).toBe('/assets/yoochan-profile.png')
  })
})
