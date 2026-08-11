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
  })

  it('switches the visible application context to Georgia Tech OMSA', () => {
    const profile = getApplicationProfile('georgia-tech-omsa')

    expect(profile.institutionShort).toBe('Georgia Tech')
    expect(profile.programs.map(({ code }) => code)).toEqual(['OMSA'])
  })

  it('falls back safely when a profile id is unknown', () => {
    expect(getApplicationProfile('unknown')).toBe(
      APPLICATION_PROFILES[DEFAULT_APPLICATION_PROFILE_ID],
    )
  })
})
