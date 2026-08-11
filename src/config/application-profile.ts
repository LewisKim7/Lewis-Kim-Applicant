export interface ApplicationProgram {
  readonly code: string
  readonly officialName: string
  readonly url: string
}

export interface ApplicationProfile {
  readonly id: string
  readonly institutionName: string
  readonly institutionShort: string
  readonly contextLabel: string
  readonly compactLabel: string
  readonly portfolioLabel: string
  readonly overviewUrl: string
  readonly applicationDescription: string
  readonly programs: readonly ApplicationProgram[]
}

export const APPLICATION_PROFILES = {
  'ut-austin': {
    id: 'ut-austin',
    institutionName: 'The University of Texas at Austin',
    institutionShort: 'UT Austin',
    contextLabel: 'UT Austin graduate application',
    compactLabel: 'UT Austin · Graduate application',
    portfolioLabel: 'AI & Data Science portfolio',
    overviewUrl: 'https://cdso.utexas.edu/',
    applicationDescription: 'graduate study in artificial intelligence and data science',
    programs: [
      {
        code: 'MSAI',
        officialName: 'Master of Science in Artificial Intelligence',
        url: 'https://cdso.utexas.edu/msai',
      },
      {
        code: 'MSDS',
        officialName: 'Master of Science in Data Science',
        url: 'https://cdso.utexas.edu/msds',
      },
    ],
  },
  'georgia-tech-omsa': {
    id: 'georgia-tech-omsa',
    institutionName: 'Georgia Institute of Technology',
    institutionShort: 'Georgia Tech',
    contextLabel: 'Georgia Tech graduate application',
    compactLabel: 'Georgia Tech · Graduate application',
    portfolioLabel: 'Analytics portfolio',
    overviewUrl: 'https://pe.gatech.edu/degrees/analytics',
    applicationDescription: 'graduate study in analytics',
    programs: [
      {
        code: 'OMSA',
        officialName: 'Online Master of Science in Analytics',
        url: 'https://pe.gatech.edu/degrees/analytics',
      },
    ],
  },
} as const satisfies Readonly<Record<string, ApplicationProfile>>

export type ApplicationProfileId = keyof typeof APPLICATION_PROFILES

export const DEFAULT_APPLICATION_PROFILE_ID: ApplicationProfileId = 'ut-austin'

export function getApplicationProfile(profileId?: string): ApplicationProfile {
  if (profileId && profileId in APPLICATION_PROFILES) {
    return APPLICATION_PROFILES[profileId as ApplicationProfileId]
  }

  return APPLICATION_PROFILES[DEFAULT_APPLICATION_PROFILE_ID]
}

export const APPLICATION_CONTEXT = getApplicationProfile(
  import.meta.env.VITE_APPLICATION_PROFILE,
)
