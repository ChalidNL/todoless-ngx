import { describe, expect, it } from 'vitest'
import { getOnboardingMode } from '../lib/onboarding-gate'

describe('onboarding gate', () => {
  // Scenario 1: first-ever install — no users exist
  it('returns admin mode when no users exist (first-ever install)', () => {
    expect(
      getOnboardingMode({ hasUsers: false, isAuthenticated: false, hasUserSeenOnboarding: false })
    ).toBe('admin')
  })

  // Scenario 2: users exist, authenticated user who hasn't seen onboarding
  it('returns user mode when authenticated but has not seen onboarding', () => {
    expect(
      getOnboardingMode({ hasUsers: true, isAuthenticated: true, hasUserSeenOnboarding: false })
    ).toBe('user')
  })

  // Scenario 3: users exist, not authenticated → show login (no onboarding)
  it('returns none when users exist but not authenticated', () => {
    expect(
      getOnboardingMode({ hasUsers: true, isAuthenticated: false, hasUserSeenOnboarding: false })
    ).toBe('none')
  })

  // Scenario 4: already onboarded
  it('returns none when user has already seen onboarding', () => {
    expect(
      getOnboardingMode({ hasUsers: true, isAuthenticated: true, hasUserSeenOnboarding: true })
    ).toBe('none')
  })

  // Edge: no users but somehow authenticated — still admin
  it('returns admin when no users exist even if authenticated', () => {
    expect(
      getOnboardingMode({ hasUsers: false, isAuthenticated: true, hasUserSeenOnboarding: false })
    ).toBe('admin')
  })
})
