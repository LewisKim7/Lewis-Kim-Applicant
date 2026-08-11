import { describe, expect, it } from 'vitest'
import {
  APPLICATION_PROFILES,
  DEFAULT_APPLICATION_PROFILE_ID,
  getApplicationProfile,
} from './application-profile'

describe('application profile switch', () => {
  it('defaults to the dual-program UT Austin profile', () => {
    const profile = getApplicationProfile()

    expect(profile.id).toBe(DEFAULT_APPLICATION_PROFILE_ID)
    expect(profile.programs.map(({ code }) => code)).toEqual(['MSAI', 'MSDS'])
    expect(`${profile.contextLabel} ${profile.portfolioLabel}`).not.toMatch(/MSAI|MSDS/)
    expect(profile.contextLabel).toBe('Prepared for graduate applications to UT Austin')
    expect(profile.portfolioLabel).toBe('Independent applicant portfolio')
    expect(profile.badgeAccent).toBe('#a84e32')
  })

  it('switches the visible application context to Georgia Tech OMSA', () => {
    const profile = getApplicationProfile('georgia-tech-omsa')

    expect(profile.institutionShort).toBe('Georgia Tech')
    expect(profile.programs.map(({ code }) => code)).toEqual(['OMSA'])
    expect(profile.badgeAccent).toBe('#b3a369')
  })

  it('falls back safely when a profile id is unknown', () => {
    expect(getApplicationProfile('unknown')).toBe(
      APPLICATION_PROFILES[DEFAULT_APPLICATION_PROFILE_ID],
    )
  })
})
